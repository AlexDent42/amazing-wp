<?php

class w2dc_search_map_form extends w2dc_search_form {
	public $listings_content = '';

	public function __construct($uid = null, $controller = 'listings_controller', $args = array(), $directories = null, $listings_content = '', $locations_array = array()) {
		global $w2dc_instance;
		
		$this->args = array_merge(array(
				'exact_categories' => array(),
				'exact_locations' => array(),
				'search_on_map_open' => 0,
				'hide_search_button' => 1,
		), $args);
		$this->uid = $uid;
		$this->controller = $controller;
		$this->listings_content = $listings_content;
		$this->locations_array = $locations_array;
		
		if (isset($this->args['exact_categories']) && !is_array($this->args['exact_categories'])) {
			if ($categories = array_filter(explode(',', $this->args['exact_categories']), 'trim')) {
				$this->args['exact_categories'] = $categories;
			}
		}

		if (isset($this->args['exact_locations']) && !is_array($this->args['exact_locations'])) {
			if ($locations = array_filter(explode(',', $this->args['exact_locations']), 'trim')) {
				$this->args['exact_locations'] = $locations;
			}
		}
		
		if ($directories) {
			$this->directories = $directories;
			foreach ($directories AS $directory_id) {
				if ($directory = $w2dc_instance->directories->getDirectoryById($directory_id)) {
					if ($directory->categories)
						$this->args['exact_categories'] = array_merge($this->args['exact_categories'], $directory->categories);
					if ($directory->locations)
						$this->args['exact_locations'] = array_merge($this->args['exact_locations'], $directory->locations);
				}
			}
		}
	}

	public function printClasses() {
		$classes = array();
		
		if (!empty($this->args['search_on_map_open'])) {
			$classes[] = 'w2dc-sidebar-open';
		}
		if (!$this->isCategoriesOrKeywords() && !$this->isLocationsOrAddress()) {
			$classes[] = 'w2dc-no-map-search-form';
		} elseif (!$this->isCategoriesOrKeywords()) {
			$classes[] = 'w2dc-no-map-search-categories';
		} elseif (!$this->isLocationsOrAddress()) {
			$classes[] = 'w2dc-no-map-search-locations';
		}
		$classes = apply_filters("w2dc_map_search_form_classes", $classes, $this);
		
		echo implode(" ", $classes);
	}

	public function display($columns = 2, $advanced_open = false) {
		global $w2dc_instance;

		// random ID needed because there may be more than 1 search form on one page
		$search_form_id = w2dc_generateRandomVal();
		
		if ($this->directories && ($directory_id = $this->directories[0]) && ($directory = $w2dc_instance->directories->getDirectoryById($directory_id))) {
			$search_url = $directory->url;
		} else {
			$search_url = ($w2dc_instance->index_page_url) ? w2dc_directoryUrl() : home_url('/');
		}
		
		$search_url = apply_filters('w2dc_search_url', $search_url, $this);

		w2dc_renderTemplate('search_map_form.tpl.php',
			array(
				'search_form_id' => $search_form_id,
				'search_url' => $search_url,
				'uid' => $this->uid,
				'args' => $this->args,
				'search_form' => $this,
				'controller' => $this->controller,
				'locations_array' => $this->locations_array,
			)
		);
	}
}
?>