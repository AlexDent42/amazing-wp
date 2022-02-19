<?php 

class w2dc_content_field_price_search extends w2dc_content_field_number_search {

	public function renderSearch($search_form_id, $columns = 2, $defaults = array()) {
		if ($this->mode == 'exact_number') {
			if (is_null($this->value)) {
				if (isset($defaults['field_' . $this->content_field->slug])) {
					$this->value = $defaults['field_' . $this->content_field->slug];
				} else {
					$this->value = '';
				}
			}
		} elseif ($this->mode == 'min_max_exact_number' || $this->mode == 'min_max' || $this->mode == 'min_max_slider' || $this->mode == 'range_slider') {
			if (is_null($this->min_max_value)) {
				if (isset($defaults['field_' . $this->content_field->slug . '_min'])) {
					$this->min_max_value['min'] = $defaults['field_' . $this->content_field->slug . '_min'];
				} else {
					$this->min_max_value['min'] = '';
				}
				if (isset($defaults['field_' . $this->content_field->slug . '_max'])) {
					$this->min_max_value['max'] = $defaults['field_' . $this->content_field->slug . '_max'];
				} else {
					$this->min_max_value['max'] = '';
				}
			}
		}

		if ($this->mode == 'exact_number') {
			w2dc_renderTemplate('search_fields/fields/price_input_exactnumber.tpl.php', array('search_field' => $this, 'columns' => $columns, 'search_form_id' => $search_form_id));
		} elseif ($this->mode == 'min_max_exact_number') {
			w2dc_renderTemplate('search_fields/fields/price_input_minmax_exactnumber.tpl.php', array('search_field' => $this, 'columns' => $columns, 'search_form_id' => $search_form_id));
		} elseif ($this->mode == 'min_max') {
			w2dc_renderTemplate('search_fields/fields/price_input_minmax.tpl.php', array('search_field' => $this, 'columns' => $columns, 'search_form_id' => $search_form_id));
		} elseif ($this->mode == 'min_max_slider' || $this->mode == 'range_slider') {
			w2dc_renderTemplate('search_fields/fields/price_input_slider.tpl.php', array('search_field' => $this, 'columns' => $columns, 'search_form_id' => $search_form_id));
		}
	}
	
	public function printVisibleSearchParams($frontend_controller) {
		if ($this->mode == 'exact_number') {
			$field_index = 'field_' . $this->content_field->slug;
			if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
				$value = $_REQUEST[$field_index];
				$url = remove_query_arg($field_index, $frontend_controller->base_url);
				echo w2dc_visibleSearchParam($this->content_field->name . ' ' . $this->content_field->formatPrice($value), $url);
			}
		} elseif ($this->mode == 'min_max_exact_number' || $this->mode == 'min_max' || $this->mode == 'min_max_slider' || $this->mode == 'range_slider') {
			$field_index = 'field_' . $this->content_field->slug . '_min';
			if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
				$url = remove_query_arg($field_index, $frontend_controller->base_url);
				$value = $_REQUEST[$field_index];
				echo w2dc_visibleSearchParam(sprintf(__("%s from %s", "W2DC"), $this->content_field->name, $this->content_field->formatPrice($value)), $url);
			}
	
			$field_index = 'field_' . $this->content_field->slug . '_max';
			if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index] && is_numeric($_REQUEST[$field_index])) {
				$url = remove_query_arg($field_index, $frontend_controller->base_url);
				$value = $_REQUEST[$field_index];
				echo w2dc_visibleSearchParam(sprintf(__("%s to %s", "W2DC"), $this->content_field->name, $this->content_field->formatPrice($value)), $url);
			}
		}
	}
}
?>