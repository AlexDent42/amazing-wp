<?php

define('W2DC_DEMO_DATA_PATH', W2DC_PATH . 'demo-data/');

class w2dc_demo_data_manager {
	public function __construct() {
		add_action('admin_menu', array($this, 'menu'));
	}

	public function menu() {
		if (defined('W2DC_DEMO') && W2DC_DEMO) {
			$capability = 'publish_posts';
		} else {
			$capability = 'manage_options';
		}
		
		add_submenu_page('w2dc_settings',
		__('Demo data Import', 'W2DC'),
		__('Demo data Import', 'W2DC'),
		$capability,
		'w2dc_demo_data',
		array($this, 'w2dc_demo_data_import_page')
		);
	}
	
	public function w2dc_demo_data_import_page() {
		if (w2dc_getValue($_POST, 'submit') && wp_verify_nonce($_POST['w2dc_csv_import_nonce'], W2DC_PATH) && (!defined('W2DC_DEMO') || !W2DC_DEMO)) {
			global $w2dc_instance;
			
			$csv_manager = new w2dc_csv_manager();
			$csv_manager->setImportType('create_listings');
			$csv_manager->createHelper();
			$csv_manager->columns_separator = ',';
			$csv_manager->values_separator = ';';
			$csv_manager->if_term_not_found = 'create';
			$csv_manager->selected_user = get_current_user_id();
			$csv_manager->do_geocode = false;
			$csv_manager->is_claimable = false;
			$csv_manager->collated_fields = array(
					'title',
					'level_id',
					'content',
					'excerpt',
					'categories_list',
					'locations_list',
					'address_line_1',
					'address_line_2',
					'latitude',
					'longitude',
					'map_icon_file',
					'phone',
					'website',
					'email',
					'images',
			);
			$csv_file_name = W2DC_DEMO_DATA_PATH . 'listings.csv';
			$csv_manager->extractCsv($csv_file_name);
			$zip_images_file_name = W2DC_DEMO_DATA_PATH . 'images.zip';
			$csv_manager->extractImages($zip_images_file_name);
			
			ob_start();
			$csv_manager->processCSV();
			ob_clean();
			
			if ($csv_manager->images_dir) {
				$csv_manager->removeImagesDir($csv_manager->images_dir);
			}
			
			$txt_files = glob(W2DC_DEMO_DATA_PATH . 'pages/*.{txt}', GLOB_BRACE);
			foreach ($txt_files AS $file) {
				$title = basename($file, '.txt');
				$content = file_get_contents($file);
				$post_id = wp_insert_post(array(
						'post_type' => 'page',
						'post_title' => $title,
						'post_content' => $content,
						'post_status' => 'publish',
						'post_author' => get_current_user_id(),
				));
			}
			
			$json_files = glob(W2DC_DEMO_DATA_PATH . 'pages/siteorigin/*.{json}', GLOB_BRACE);
			$html_files = glob(W2DC_DEMO_DATA_PATH . 'pages/siteorigin/*.{html}', GLOB_BRACE);
			foreach ($html_files AS $file) {
				$title = basename($file, '.html');
				$html = file_get_contents($file);
				$post_id = wp_insert_post(array(
						'post_type' => 'page',
						'post_title' => $title,
						'post_content' => $html,
						'post_status' => 'publish',
						'post_author' => get_current_user_id(),
				));
					
				$json_file_index = array_search(str_replace('.html', '.json', $file), $json_files);
				if (isset($json_files[$json_file_index]) && ($json_file = $json_files[$json_file_index]) && file_exists($json_file)) {
					$json = file_get_contents($json_file);
					$panels_data = json_decode($json, true);
					update_post_meta($post_id, 'panels_data', $panels_data);
				}
			}
			
			w2dc_addMessage(sprintf(__("Import of the demo data was successfully completed. Look at your <a href='%s'>listings</a> and <a href='%s'>custom pages</a>.", "W2DC"), admin_url('edit.php?post_type=w2dc_listing'), admin_url('edit.php?post_type=page')));
			
			w2dc_renderTemplate('demo_data_import.tpl.php');
		} else {
			$this->importInstructions();
		}
	}
	
	public function importInstructions() {
		w2dc_renderTemplate('demo_data_import.tpl.php');
	}
}

?>