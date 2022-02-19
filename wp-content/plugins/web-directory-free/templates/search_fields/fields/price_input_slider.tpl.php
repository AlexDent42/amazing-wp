<?php $index = $search_field->content_field->id . '_' . $search_form_id; ?>
<?php if (count($search_field->min_max_options) && $search_field->mode == 'min_max_slider'): ?>
<?php $min_value = (($search_field->min_max_value['min']) ? $search_field->min_max_value['min'] : __('min', 'W2DC')); ?>
<?php $max_value = (($search_field->min_max_value['max']) ? $search_field->min_max_value['max'] : __('max', 'W2DC')); ?>
<?php elseif ($search_field->mode == 'range_slider'): ?>
<?php $min_value = (($search_field->min_max_value['min']) ? $search_field->min_max_value['min'] : __('min', 'W2DC')); ?>
<?php $max_value = (($search_field->min_max_value['max']) ? $search_field->min_max_value['max'] : __('max', 'W2DC')); ?>
<?php endif; ?>
<div class="w2dc-row w2dc-field-search-block-price w2dc-field-search-block-<?php echo $search_field->content_field->id; ?> w2dc-field-search-block-<?php echo $search_field->content_field->type; ?> w2dc-field-search-block-<?php echo $search_form_id; ?> w2dc-field-search-block-<?php echo $index; ?>">
	<div class="w2dc-col-md-12">
		<label>
			<?php echo $search_field->content_field->name; ?>
			<span id="slider_label_<?php echo $index; ?>">
				<?php if ($search_field->content_field->symbol_position == 1): ?>
				<?php echo $search_field->content_field->currency_symbol . $min_value . ' - ' . $search_field->content_field->currency_symbol . $max_value; ?>
				<?php elseif ($search_field->content_field->symbol_position == 2): ?>
				<?php echo $search_field->content_field->currency_symbol . ' ' . $min_value . ' - ' . $search_field->content_field->currency_symbol . ' ' . $max_value; ?>
				<?php elseif ($search_field->content_field->symbol_position == 3): ?>
				<?php echo $min_value . $search_field->content_field->currency_symbol . ' - ' . $max_value . $search_field->content_field->currency_symbol; ?>
				<?php elseif ($search_field->content_field->symbol_position == 4): ?>
				<?php echo $min_value . ' ' . $search_field->content_field->currency_symbol . ' - ' . $max_value . ' ' . $search_field->content_field->currency_symbol; ?>
				<?php endif; ?>
			</span>
		</label>
	</div>
	
	<script>
		(function($) {
			"use strict";
		
			$(function() {
				<?php if (count($search_field->min_max_options) && $search_field->mode == 'min_max_slider'): ?>
				var slider_params_<?php echo $index; ?> = ['<?php _e('min', 'W2DC'); ?>', <?php echo implode(',', $search_field->min_max_options); ?>, '<?php _e('max', 'W2DC'); ?>'];
				var slider_min_<?php echo $index; ?> = 0;
				var slider_max_<?php echo $index; ?> = slider_params_<?php echo $index; ?>.length-1;
				<?php elseif ($search_field->mode == 'range_slider'): ?>
				<?php
				$max_degrees = 10;
				if (($search_field->slider_step_1_max - $search_field->slider_step_1_min) > $max_degrees) {
					$sub = $search_field->slider_step_1_max - $search_field->slider_step_1_min;
					$length = $search_field->slider_step_1_min;
					for ($i=1; $i < $max_degrees; $i++) {
						$length += ($sub / $max_degrees);
						$slider_params[] = floor($length);
						
					}
				} else {
					$slider_params = range($search_field->slider_step_1_min, $search_field->slider_step_1_max);
				} ?>
				var slider_params_<?php echo $index; ?> = ['<?php _e('min', 'W2DC'); ?>', <?php echo implode(',', $slider_params); ?>, '<?php _e('max', 'W2DC'); ?>'];
				var slider_min_<?php echo $index; ?> = <?php echo $search_field->slider_step_1_min-1; ?>;
				var slider_max_<?php echo $index; ?> = <?php echo $search_field->slider_step_1_max+1; ?>;
				<?php endif; ?>
				$('#range_slider_<?php echo $index; ?>').slider({
					<?php if (function_exists('is_rtl') && is_rtl()): ?>
					isRTL: true,
					<?php endif; ?>
					min: slider_min_<?php echo $index; ?>,
					max: slider_max_<?php echo $index; ?>,
					range: true,
					<?php if (count($search_field->min_max_options) && $search_field->mode == 'min_max_slider'): ?>
					values: [<?php echo ((($min = array_search($search_field->min_max_value['min'], $search_field->min_max_options)) !== false) ? $min+1 : 0); ?>, <?php echo ((($max = array_search($search_field->min_max_value['max'], $search_field->min_max_options)) !== false) ? $max+1 : count($search_field->min_max_options)+1); ?>],
					<?php elseif ($search_field->mode == 'range_slider'): ?>
					values: [<?php echo (($search_field->min_max_value['min']) ? $search_field->min_max_value['min']+1 : $search_field->slider_step_1_min-1); ?>, <?php echo (($search_field->min_max_value['max']) ? $search_field->min_max_value['max']+1 : $search_field->slider_step_1_max+1); ?>],
					<?php endif; ?>
					slide: function(event, ui) {
						if ((ui.values[0]) >= ui.values[1]) {
				            return false;
				        }

						<?php if ($search_field->content_field->symbol_position == 1): ?>
						var pre_symbol_position = '<?php echo esc_js($search_field->content_field->currency_symbol); ?>';
						var post_symbol_position = '';
						<?php elseif ($search_field->content_field->symbol_position == 2): ?>
						var pre_symbol_position = '<?php echo esc_js($search_field->content_field->currency_symbol); ?> ';
						var post_symbol_position = '';
						<?php elseif ($search_field->content_field->symbol_position == 3): ?>
						var pre_symbol_position = '';
						var post_symbol_position = '<?php echo esc_js($search_field->content_field->currency_symbol); ?>';
						<?php elseif ($search_field->content_field->symbol_position == 4): ?>
						var pre_symbol_position = '';
						var post_symbol_position = ' <?php echo esc_js($search_field->content_field->currency_symbol); ?>';
						<?php endif; ?>

						<?php if (count($search_field->min_max_options) && $search_field->mode == 'min_max_slider'): ?>
						$('#slider_label_<?php echo $index; ?>').html(pre_symbol_position + slider_params_<?php echo $index; ?>[ui.values[0]] + post_symbol_position + ' - ' + pre_symbol_position + slider_params_<?php echo $index; ?>[ui.values[1]] + post_symbol_position);
						<?php elseif ($search_field->mode == 'range_slider'): ?>
						if (ui.values[0] == <?php echo $search_field->slider_step_1_min-1; ?>) {
							var min = '<?php _e('min', 'W2DC'); ?>';
						} else {
							var min = ui.values[0];
						}
						if (ui.values[1] == <?php echo $search_field->slider_step_1_max+1; ?>) {
							var max = '<?php _e('max', 'W2DC'); ?>';
						} else {
							var max = ui.values[1];
						}

						$('#slider_label_<?php echo $index; ?>').html(pre_symbol_position + min + post_symbol_position + ' - ' + pre_symbol_position + max + post_symbol_position);
						<?php endif; ?>
					},
					stop: function(event, ui) {
						if ((ui.values[0]) >= ui.values[1]) {
				            return false;
				        }

						<?php if (count($search_field->min_max_options) && $search_field->mode == 'min_max_slider'): ?>
						if (slider_params_<?php echo $index; ?>[ui.values[0]] == '<?php _e('min', 'W2DC'); ?>')
							$('#field_<?php echo $index; ?>_min').val('');
						else
							$('#field_<?php echo $index; ?>_min').val(slider_params_<?php echo $index; ?>[ui.values[0]]);
						if (slider_params_<?php echo $index; ?>[ui.values[1]] == '<?php _e('max', 'W2DC'); ?>')
							$('#field_<?php echo $index; ?>_max').val('').trigger("change");
						else
							$('#field_<?php echo $index; ?>_max').val(slider_params_<?php echo $index; ?>[ui.values[1]]).trigger("change");
						<?php elseif ($search_field->mode == 'range_slider'): ?>
						if (ui.values[0] == <?php echo $search_field->slider_step_1_min-1; ?>) {
							$('#field_<?php echo $index; ?>_min').val('');
						} else {
							$('#field_<?php echo $index; ?>_min').val(ui.values[0]);
						}
						if (ui.values[1] == <?php echo $search_field->slider_step_1_max+1; ?>) {
							$('#field_<?php echo $index; ?>_max').val('').trigger("change");
						} else {
							$('#field_<?php echo $index; ?>_max').val(ui.values[1]).trigger("change");
						}
						<?php endif; ?>
					}
				}).each(function() {
					$.each(slider_params_<?php echo $index; ?>, function(index, value) {
						<?php if (!is_rtl()): ?>
						var position = 'left';
						<?php else: ?>
						var position = 'right';
						<?php endif ?>
						<?php if ($columns == 1): ?>
						var odd_even_label = 2;
						<?php elseif ($columns == 2): ?>
						var odd_even_label = 1;
						<?php endif; ?>
						if (index % odd_even_label == 0) {
							<?php if ($search_field->content_field->symbol_position == 1): ?>
							var pre_symbol_position = '<?php echo esc_js($search_field->content_field->currency_symbol); ?>';
							var post_symbol_position = '';
							<?php elseif ($search_field->content_field->symbol_position == 2): ?>
							var pre_symbol_position = '<?php echo esc_js($search_field->content_field->currency_symbol); ?> ';
							var post_symbol_position = '';
							<?php elseif ($search_field->content_field->symbol_position == 3): ?>
							var pre_symbol_position = '';
							var post_symbol_position = '<?php echo esc_js($search_field->content_field->currency_symbol); ?>';
							<?php elseif ($search_field->content_field->symbol_position == 4): ?>
							var pre_symbol_position = '';
							var post_symbol_position = ' <?php echo esc_js($search_field->content_field->currency_symbol); ?>';
							<?php endif; ?>
							var el = $('<label><span>|</span><span class="w2dc-range-slider-label">' + pre_symbol_position + value + post_symbol_position + '</span></label>').css(position, (100/(slider_params_<?php echo $index; ?>.length-1))*index + '%');
						} else {
							var el = $('<label><span>|</span></label>').css(position, (100/(slider_params_<?php echo $index; ?>.length-1))*index + '%');
						}
						$('#range_slider_<?php echo $index; ?>_scale').append(el);
					});
				});
			});
		})(jQuery);
	</script>
	<div class="w2dc-col-md-12">
		<div class="w2dc-jquery-ui-slider">
			<div id="range_slider_<?php echo $index; ?>"></div>
			<div id="range_slider_<?php echo $index; ?>_scale" class="w2dc-range-slider-scale"></div>
			<input type="hidden" id="field_<?php echo $index; ?>_min" name="field_<?php echo $search_field->content_field->slug; ?>_min" value="<?php echo (($min_value == __('min', 'W2DC')) ? '' : $min_value); ?>" />
			<input type="hidden" id="field_<?php echo $index; ?>_max" name="field_<?php echo $search_field->content_field->slug; ?>_max" value="<?php echo (($max_value == __('max', 'W2DC')) ? '' : $max_value); ?>" />
		</div>
		
	</div>
</div>
