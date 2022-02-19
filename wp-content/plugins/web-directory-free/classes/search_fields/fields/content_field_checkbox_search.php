<?php 

class w2dc_content_field_checkbox_search extends w2dc_content_field_select_search {
	
	public function getVCParams() {
		return array(
				array(
						'type' => 'checkbox',
						'param_name' => 'field_' . $this->content_field->slug,
						'heading' => $this->content_field->name,
						'value' => array_flip($this->content_field->selection_items),
				),
		);
	}

}
?>