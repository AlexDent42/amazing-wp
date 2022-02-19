<form class="w2dc-content w2dc-map-search-form w2dc-search-form-submit <?php $search_form->printClasses(); ?>" id="w2dc-map-search-form-<?php echo $uid; ?>" data-id="<?php echo $search_form_id; ?>">
	<?php $search_form->outputHiddenFields(); ?>
	<?php if ($search_form->isCategoriesOrKeywords()): ?>
	<div class="w2dc-map-search-wrapper" id="w2dc-map-search-wrapper-<?php echo $uid; ?>">
		<div class="w2dc-map-search-input-container">
			<div class="w2dc-row w2dc-form-group">
				<div class="w2dc-col-md-12">
					<?php
					if ($search_form->isCategories()) {
						w2dc_tax_dropdowns_menu_init($search_form->getCategoriesDropdownsMenuParams(__('Select category', 'W2DC'), __('Select category or enter keywords', 'W2DC'))); 
					} else { ?>
					<div class="w2dc-has-feedback">
						<input name="what_search" value="<?php echo esc_attr($search_form->getKeywordValue()); ?>" placeholder="<?php esc_attr_e('Enter keywords', 'W2DC')?>" class="<?php if ($search_form->isKeywordsAJAX()): ?>w2dc-keywords-autocomplete<?php endif; ?> w2dc-form-control w2dc-main-search-field" autocomplete="off" />
					</div>
					<?php } ?>
				</div>
			</div>
		</div>
		<div class="w2dc-map-search-toggle-container">
			<span class="w2dc-map-search-toggle" data-id="<?php echo $uid; ?>"></span>
		</div>
	</div>
	<?php endif; ?>
	<div class="w2dc-map-search-panel-wrapper" id="w2dc-map-search-panel-wrapper-<?php echo $uid; ?>">
		<?php if ($search_form->isLocationsOrAddress()): ?>
		<div class="w2dc-map-search-panel">
			<div class="w2dc-row w2dc-form-group">
				<div class="w2dc-col-md-12">
					<?php
					if ($search_form->isLocations()) {
						w2dc_tax_dropdowns_menu_init($search_form->getLocationsDropdownsMenuParams(__('Select location', 'W2DC'), __('Select location or enter address', 'W2DC')));
					} else { ?>
					<div class="w2dc-has-feedback">
						<input name="address" value="<?php echo esc_attr($search_form->getAddressValue()); ?>" placeholder="<?php esc_attr_e('Enter address', 'W2DC')?>" class="w2dc-address-autocomplete w2dc-form-control w2dc-main-search-field" autocomplete="off" />
					</div>
					<?php } ?>
				</div>
			</div>
			<?php if ($search_form->isRadius()): ?>
				<div class="w2dc-jquery-ui-slider">
					<div class="w2dc-search-radius-label">
						<?php _e('Search in radius', 'W2DC'); ?>
						<strong id="radius_label_<?php echo $search_form_id; ?>"><?php echo $search_form->getRadiusValue(); ?></strong>
						<?php if (get_option('w2dc_miles_kilometers_in_search') == 'miles') _e('miles', 'W2DC'); else _e('kilometers', 'W2DC'); ?>
					</div>
					<div class="w2dc-radius-slider" data-id="<?php echo $search_form_id; ?>" id="radius_slider_<?php echo $search_form_id; ?>"></div>
					<input type="hidden" name="radius" id="radius_<?php echo $search_form_id; ?>" value="<?php echo $search_form->getRadiusValue(); ?>" />
				</div>
			<?php endif; ?>
		</div>
		<?php endif; ?>
		<div class="w2dc-map-listings-panel" id="w2dc-map-listings-panel-<?php echo $uid; ?>">
			<?php echo $search_form->listings_content; ?>
		</div>
	</div>
	
	<?php if (!$search_form->isCategoriesOrKeywords()): ?>
	<div class="w2dc-map-sidebar-toggle-container w2dc-map-sidebar-toggle-container-<?php echo $uid; ?>">
		<span class="w2dc-map-sidebar-toggle" data-id="<?php echo $uid; ?>"></span>
	</div>
	<?php endif; ?>
	<div class="w2dc-map-sidebar-toggle-container-mobile w2dc-map-sidebar-toggle-container-mobile-<?php echo $uid; ?>" data-id="<?php echo $uid; ?>" title="<?php esc_attr_e("Search panel", "W2DC"); ?>">
		<span class="w2dc-map-sidebar-toggle"></span>
	</div>
	<input type="submit" name="submit" class="w2dc-submit-button-hidden" tabindex="-1" />
</form>