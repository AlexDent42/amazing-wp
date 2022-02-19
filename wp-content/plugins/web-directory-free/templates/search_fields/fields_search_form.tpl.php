<?php if ($search_fields || $search_fields_advanced): ?>
<div class="w2dc-clearfix"></div>
<script>
	(function($) {
		"use strict";
	
		$(function() {

			$(document).on("w2dc:selected_tax_change", "#w2dc-search-form-<?php echo $search_form_id; ?> .selected_tax_<?php echo W2DC_CATEGORIES_TAX; ?>", function() {
				hideShowFields_<?php echo $search_form_id; ?>($(this).val());
			});
	
			if ($("#w2dc-search-form-<?php echo $search_form_id; ?> .selected_tax_<?php echo W2DC_CATEGORIES_TAX; ?>").length > 0) {
				hideShowFields_<?php echo $search_form_id; ?>($("#w2dc-search-form-<?php echo $search_form_id; ?> .selected_tax_<?php echo W2DC_CATEGORIES_TAX; ?>").val());
			} else {
				hideShowFields_<?php echo $search_form_id; ?>(0);
			}
	
			function hideShowFields_<?php echo $search_form_id; ?>(id) {
				var selected_categories_ids = [id];
	
				$(".w2dc-field-search-block-<?php echo $search_form_id; ?>").hide();
				$.each(w2dc_fields_in_categories_<?php echo $search_form_id; ?>, function(index, value) {
					var show_field = false;
					if (value != undefined) {
						if (value.length > 0) {
							var key;
							for (key in value) {
								var key2;
								for (key2 in selected_categories_ids)
									if (value[key] == selected_categories_ids[key2])
										show_field = true;
							}
						}
						
						if ((value.length == 0 || show_field) && $(".w2dc-field-search-block-"+index+"_<?php echo $search_form_id; ?>").length) {
							$(".w2dc-field-search-block-"+index+"_<?php echo $search_form_id; ?>").show();
						}
					}
				});

				<?php if ($is_advanced_search_panel): ?>
				$("#w2dc-advanced-search-label_<?php echo $search_form_id; ?>").hide();
				$("#w2dc_advanced_search_fields_<?php echo $search_form_id; ?> .w2dc-search-content-field > div").map(function() {
					if ($(this).css("display") == 'block') {
						$("#w2dc-advanced-search-label_<?php echo $search_form_id; ?>").show();
					}
				});
				<?php endif; ?>
			}
		});
	})(jQuery);
</script>

<div id="w2dc_standard_search_fields_<?php echo $search_form_id; ?>" class="w2dc-search-fields-block">
	<?php foreach ($search_fields AS $search_field): ?>
	<div class="w2dc-search-content-field">
		<?php $search_field->renderSearch($search_form_id, $columns, $defaults); ?>
	</div>
	<?php endforeach; ?>
</div>
<?php if ($is_advanced_search_panel): ?>
<input type="hidden" name="use_advanced" id="use_advanced_<?php echo $search_form_id; ?>" value="<?php echo (int)$advanced_open; ?>" autocomplete="off" />
<div id="w2dc_advanced_search_fields_<?php echo $search_form_id; ?>" <?php if (!$advanced_open): ?>style="display: none;"<?php endif; ?> class="w2dc-search-fields-block">
	<?php foreach ($search_fields_advanced AS $search_field): ?>
	<div class="w2dc-search-content-field">
		<?php $search_field->renderSearch($search_form_id, $columns, $defaults); ?>
	</div>
	<?php endforeach; ?>
</div>
<?php endif; ?>
<?php endif; ?>