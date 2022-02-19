<?php $search_form->getSearchFormStyles(); ?>
<form <?php echo $search_form->getFormAttributes(); ?>>
	<?php $search_form->outputHiddenFields(); ?>

	<div class="w2dc-search-overlay w2dc-container-fluid">
		<?php if ($search_form->isDefaultSearchFields()): ?>
		<div class="w2dc-search-section w2dc-row">
			<?php if ($search_form->isCategoriesOrKeywords()): ?>
			<?php do_action('pre_search_what_form_html', $search_form_id); ?>
			<div class="w2dc-col-md-<?php echo $search_form->getColMd(); ?> w2dc-search-input-field-wrap">
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
						<?php if ($search_form->isKeywordsExamples()): ?>
						<p class="w2dc-search-suggestions">
							<?php printf(__("Try to search: %s", "W2DC"), $search_form->getKeywordsExamples()); ?>
						</p>
						<?php endif; ?>
					</div>
				</div>
			</div>
			<?php do_action('post_search_what_form_html', $search_form_id); ?>
			<?php endif; ?>
			
			<?php if ($search_form->isLocationsOrAddress()): ?>
			<?php do_action('pre_search_where_form_html', $search_form_id); ?>
			<div class="w2dc-col-md-<?php echo $search_form->getColMd(); ?> w2dc-search-input-field-wrap">
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
			</div>
			<?php do_action('post_search_where_form_html', $search_form_id); ?>
			<?php endif; ?>
			
			<?php if ($search_form->args['on_row_search_button']): ?>
			<div class="w2dc-col-md-2 w2dc-search-submit-button-wrap">
				<?php $search_form->displaySearchButton(true); ?>
			</div>
			<?php endif; ?>
			
			<?php if ($search_form->isRadius()): ?>
			<div class="w2dc-col-md-12">
				<div class="w2dc-jquery-ui-slider">
					<div class="w2dc-search-radius-label">
						<?php _e('Search in radius', 'W2DC'); ?>
						<strong id="radius_label_<?php echo $search_form_id; ?>"><?php echo $search_form->getRadiusValue(); ?></strong>
						<?php if (get_option('w2dc_miles_kilometers_in_search') == 'miles') _e('miles', 'W2DC'); else _e('kilometers', 'W2DC'); ?>
					</div>
					<div class="w2dc-radius-slider" data-id="<?php echo $search_form_id; ?>" id="radius_slider_<?php echo $search_form_id; ?>"></div>
					<input type="hidden" name="radius" id="radius_<?php echo $search_form_id; ?>" value="<?php echo $search_form->getRadiusValue(); ?>" />
				</div>
			</div>
			<?php endif; ?>
		</div>
		<?php endif; ?>

		<?php $w2dc_instance->search_fields->render_content_fields($search_form_id, $search_form->args['columns'], $search_form); ?>

		<?php do_action('post_search_form_html', $search_form_id); ?>

		<div class="w2dc-search-section w2dc-search-form-bottom w2dc-row w2dc-clearfix">
			<?php if (!$search_form->args['on_row_search_button']): ?>
			<?php $search_form->displaySearchButton(); ?>
			<?php endif; ?>

			<?php if ($search_form->is_advanced_search_panel): ?>
			<script>
				(function($) {
					"use strict";

					$(function() {
						w2dc_advancedSearch(<?php echo $search_form_id; ?>, "<?php _e('More filters', 'W2DC'); ?>", "<?php _e('Less filters', 'W2DC'); ?>");
					});
				})(jQuery);
			</script>
			<div class="w2dc-col-md-6 w2dc-form-group w2dc-pull-left">
				<a id="w2dc-advanced-search-label_<?php echo $search_form_id; ?>" class="w2dc-advanced-search-label" href="javascript: void(0);"><span class="w2dc-advanced-search-text"><?php _e('More filters', 'W2DC'); ?></span> <span class="w2dc-advanced-search-toggle w2dc-glyphicon w2dc-glyphicon-chevron-down"></span></a>
			</div>
			<?php endif; ?>

			<?php do_action('buttons_search_form_html', $search_form_id); ?>
		</div>
	</div>
</form>