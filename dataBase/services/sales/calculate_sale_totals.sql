-- Funcion auxiliar para calcular totales de una venta a partir de detalles en JSON
CREATE OR REPLACE FUNCTION calculate_sale_totals(p_details JSON)
RETURNS TABLE(subtotal DECIMAL, tax_total DECIMAL, total DECIMAL) AS $$
DECLARE
    v_subtotal DECIMAL := 0;
    v_tax_total DECIMAL := 0;
    v_item JSON;
BEGIN
    FOR v_item IN SELECT * FROM json_array_elements(p_details)
    LOOP
        DECLARE
            v_quantity DECIMAL := (v_item->>'quantity')::DECIMAL;
            v_unit_price DECIMAL := (v_item->>'unitPrice')::DECIMAL;
            v_discount_rate DECIMAL := COALESCE((v_item->>'discountRate')::DECIMAL, 0);
            v_tax_rate DECIMAL := (v_item->>'taxRate')::DECIMAL;
            v_is_excluded BOOLEAN := COALESCE((v_item->>'isExcluded')::BOOLEAN, false);
            v_item_subtotal DECIMAL;
        BEGIN
            v_item_subtotal := v_quantity * v_unit_price * (1 - v_discount_rate/100);
            v_subtotal := v_subtotal + v_item_subtotal;
            IF NOT v_is_excluded THEN
                v_tax_total := v_tax_total + (v_item_subtotal * v_tax_rate/100);
            END IF;
        END;
    END LOOP;
    RETURN QUERY SELECT v_subtotal, v_tax_total, v_subtotal + v_tax_total;
END;
$$ LANGUAGE plpgsql;