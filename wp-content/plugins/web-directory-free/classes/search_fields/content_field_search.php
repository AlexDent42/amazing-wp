<?php 

class w2dc_content_field_search {
	public $value;
	public $value_loaded = false;
	public $params = array();

	public $content_field;
	
	public function assignContentField($content_field) {
		$this->content_field = $content_field;
	}
	
	public function convertSearchOptions() {
		if ($this->content_field->search_options) {
			if (is_string($this->content_field->search_options)) {
				$unserialized_options = unserialize($this->content_field->search_options);
			} elseif (is_array($this->content_field->search_options)) {
				$unserialized_options = $this->content_field->search_options;
			}
			if (count($unserialized_options) > 1 || $unserialized_options != array('')) {
				$this->content_field->search_options = $unserialized_options;
				if (method_exists($this, 'buildSearchOptions')) {
					$this->buildSearchOptions();
				}
				return $this->content_field->search_options;
			}
		}
		return array();
	}
	
	/**
	 * Save parameters passed from a search form, this could be params of a shortcode
	 * 
	 * @param array $params
	 */
	public function addParams($params) {
		$this->params = $params;
	}
	
	public function getBaseUrlArgs(&$args) {
		$field_index = 'field_' . $this->content_field->slug;
		
		if (isset($_REQUEST[$field_index]) && $_REQUEST[$field_index]) {
			$args[$field_index] = $_REQUEST[$field_index];
		}
	}

	public function printVisibleSearchParams($frontend_controller) {
	}
	
	public function getVCParams() {
		return array();
	}
	
	public function isParamOfThisField($param) {
		if ($param == 'field_' . $this->content_field->slug) {
			return true;
		}
	}
	
	public function loadValue($defaults = array(), $include_GET_params = true) {
		$field_index = 'field_' . $this->content_field->slug;
	
		if ($include_GET_params) {
			$this->value = ((w2dc_getValue($_REQUEST, $field_index, false) !== false) ? w2dc_getValue($_REQUEST, $field_index) : w2dc_getValue($defaults, $field_index));
		}
	}
	
	public function resetValue() {
		$this->value = null;
	}
}
?>