<?php w2dc_renderTemplate('admin_header.tpl.php'); ?>

<h2>
	<?php printf(__('Configure %s search field', 'W2DC'), $w2dc_instance->content_fields->fields_types_names[$search_field->content_field->type]); ?>
</h2>

<form method="POST" action="">
	<?php wp_nonce_field(W2DC_PATH, 'w2dc_configure_content_fields_nonce');?>
	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row">
					<label><?php _e('Search input mode', 'W2DC'); ?><span class="w2dc-red-asterisk">*</span></label>
				</th>
				<td>
					<label>
						<input
							name="search_input_mode"
							type="radio"
							value="keywords"
							<?php checked($search_field->search_input_mode, 'keywords'); ?> />
						<?php _e('Search by keywords field', 'W2DC'); ?>
					</label>
					<br />
					<label>
						<input
							name="search_input_mode"
							type="radio"
							value="input"
							<?php checked($search_field->search_input_mode, 'input'); ?> />
							<?php _e('Render own search field', 'W2DC'); ?>
					</label>
				</td>
			</tr>
		</tbody>
	</table>
	
	<?php submit_button(__('Save changes', 'W2DC')); ?>
</form>

<?php w2dc_renderTemplate('admin_footer.tpl.php'); ?>