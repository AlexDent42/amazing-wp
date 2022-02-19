<?php 

class w2dc_content_field_hours extends w2dc_content_field {
	public $hours_clock = 12;
	public $week_days;
	
	protected $can_be_required = false;
	protected $can_be_ordered = false;
	protected $is_configuration_page = true;
	protected $can_be_searched = false;
	protected $is_search_configuration_page = false;
	
	public function __construct() {
		$this->week_days = array('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat');
	}
	
	public function isNotEmpty($listing) {
		if (array_filter($this->value))
			return true;
		else
			return false;
	}

	public function configure() {
		global $wpdb, $w2dc_instance;
	
		if (w2dc_getValue($_POST, 'submit') && wp_verify_nonce($_POST['w2dc_configure_content_fields_nonce'], W2DC_PATH)) {
			$validation = new w2dc_form_validation();
			$validation->set_rules('hours_clock', __('Time convention', 'W2DC'), 'required');
			if ($validation->run()) {
				$result = $validation->result_array();
				if ($wpdb->update($wpdb->w2dc_content_fields, array('options' => serialize(array('hours_clock' => $result['hours_clock']))), array('id' => $this->id), null, array('%d')))
					w2dc_addMessage(__('Field configuration was updated successfully!', 'W2DC'));
	
				$w2dc_instance->content_fields_manager->showContentFieldsTable();
			} else {
				$this->hours_clock = $validation->result_array('hours_clock');

				w2dc_renderTemplate('content_fields/fields/hours_configuration.tpl.php', array('content_field' => $this));
			}
		} else
			w2dc_renderTemplate('content_fields/fields/hours_configuration.tpl.php', array('content_field' => $this));
	}
	
	public function buildOptions() {
		if (isset($this->options['hours_clock']))
			$this->hours_clock = $this->options['hours_clock'];
	}
	
	public function orderWeekDays() {
		$week = array(intval(get_option('start_of_week')));
		while (count($week) < 7) {
			$day_num = $week[count($week)-1]+1;
			if ($day_num == 7) $day_num = 0;
			$week[] = $day_num;
		}
		foreach ($week AS $day_num)
			$week_days[$day_num] = $this->week_days[$day_num];
		
		$this->week_days_names = array(__('Sunday', 'W2DC'), __('Monday', 'W2DC'), __('Tuesday', 'W2DC'), __('Wednesday', 'W2DC'), __('Thursday', 'W2DC'), __('Friday', 'W2DC'), __('Saturday', 'W2DC'));
		
		return $week_days;
	}

	public function renderInput() {
		$week_days = $this->orderWeekDays();

		if (!($template = w2dc_isTemplate('content_fields/fields/hours_input_'.$this->id.'.tpl.php'))) {
			$template = 'content_fields/fields/hours_input.tpl.php';
		}
		
		$template = apply_filters('w2dc_content_field_input_template', $template, $this);
			
		w2dc_renderTemplate($template, array('content_field' => $this, 'week_days' => $week_days));
	}
	
	public function validateValues(&$errors, $data) {
		$validation = new w2dc_form_validation();
		foreach ($this->week_days AS $day) {
			if ($this->hours_clock == 12) {
				$validation->set_rules($day.'_from_hour_' . $this->id, $this->name);
				$validation->set_rules($day.'_from_am_pm_' . $this->id, $this->name);
				$validation->set_rules($day.'_to_hour_' . $this->id, $this->name);
				$validation->set_rules($day.'_to_am_pm_' . $this->id, $this->name);
			} elseif ($this->hours_clock == 24) {
				$validation->set_rules($day.'_from_hour_' . $this->id, $this->name);
				$validation->set_rules($day.'_to_hour_' . $this->id, $this->name);
			}
			$validation->set_rules($day.'_closed_' . $this->id, 'is_checked');
		}
		if (!$validation->run()) {
			$errors[] = $validation->error_array();
		}

		$value = array();
		
		foreach ($this->week_days AS $day) {
			if (!$validation->result_array($day.'_closed_'.$this->id)) {
				$from_hour = $validation->result_array($day.'_from_hour_'.$this->id);
				$to_hour = $validation->result_array($day.'_to_hour_'.$this->id);
				$from_am_pm = $validation->result_array($day.'_from_am_pm_'.$this->id);
				$to_am_pm = $validation->result_array($day.'_to_am_pm_'.$this->id);
				if (
					$from_hour != '00:00' ||
					$to_hour != '00:00' ||
					($this->hours_clock == 12 && $from_am_pm != 'AM') ||
					($this->hours_clock == 12 && $to_am_pm != 'AM')
				) {
					$value[$day.'_from'] = $from_hour.(($this->hours_clock == 12) ? ' '.$from_am_pm : '');
					$value[$day.'_to'] = $to_hour.(($this->hours_clock == 12) ? ' '.$to_am_pm : '');
				}
			} else {
				$value[$day.'_closed'] = $validation->result_array($day.'_closed_'.$this->id);
			}
		}
		return $value;
	}
	
	public function saveValue($post_id, $validation_results) {
		return update_post_meta($post_id, '_content_field_' . $this->id, $validation_results);
	}
	
	public function loadValue($post_id) {
		$value = get_post_meta($post_id, '_content_field_' . $this->id, true);
		foreach ($this->week_days AS $day) {
			foreach (array('_from', '_to', '_closed') AS $from_to_closed) {
				if (isset($value[$day.$from_to_closed])) {
					$this->value[$day.$from_to_closed] = $value[$day.$from_to_closed];
				} else {
					$this->value[$day.$from_to_closed] = '';
				}
			}
		}

		$this->value = apply_filters('w2dc_content_field_load', $this->value, $this, $post_id);
		return $this->value;
	}
	
	public function renderOutput($listing, $group = null, $css_classes = '') {
		if (!($template = w2dc_isTemplate('content_fields/fields/hours_output_'.$this->id.'.tpl.php'))) {
			$template = 'content_fields/fields/hours_output.tpl.php';
		}
		
		$template = apply_filters('w2dc_content_field_output_template', $template, $this, $listing, $group);
		
		w2dc_renderTemplate($template, array('content_field' => $this, 'listing' => $listing, 'group' => $group, 'css_classes' => $css_classes));
	}
	
	public function renderOutputForMap($location, $listing) {
		if ($strings = $this->processStrings())
			return '<div class="w2dc-map-field-hours">' . implode('<br />', $this->processStrings()) . '</div>';
	}
	
	public function processStrings() {
		$week_days = $this->orderWeekDays();
		
		$this->week_days_names = array(__('Sun.', 'W2DC'), __('Mon.', 'W2DC'), __('Tue.', 'W2DC'), __('Wed.', 'W2DC'), __('Thu.', 'W2DC'), __('Fri.', 'W2DC'), __('Sat.', 'W2DC'));
		$strings = array();
		foreach ($week_days AS $key=>$day) {
			if ($this->value[$day.'_from'] || $this->value[$day.'_to'] || $this->value[$day.'_closed'])
				$strings[] = '<strong>' . $this->week_days_names[$key] . '</strong> ' . (($this->value[$day.'_closed']) ? __('Closed', 'W2DC') : $this->value[$day.'_from'] . ' - ' . $this->value[$day.'_to']);
		}
		
		$strings = apply_filters('w2dc_content_field_hours_strings', $strings);
		
		return $strings;
	}
	
	public function getOptionsHour($index) {
		if ($this->hours_clock == 12) {
			$time = explode(' ', $this->value[$index]);
			if ($time && $time[0]) {
				$hour = $time[0];
			} else { 
				$hour = '00:00';
			}
		} elseif ($this->hours_clock == 24) {
			if ($this->value[$index]) {
				$hour = $this->value[$index];
			} else {
				$hour = '00:00';
			}
		}
		
		$hours_set = array(
				'00:00',
				'00:30',
				'01:00',
				'01:30',
				'02:00',
				'02:30',
				'03:00',
				'03:30',
				'04:00',
				'04:30',
				'05:00',
				'05:30',
				'06:00',
				'06:30',
				'07:00',
				'07:30',
				'08:00',
				'08:30',
				'09:00',
				'09:30',
				'10:00',
				'10:30',
				'11:00',
				'11:30',
				'12:00',
				'12:30',
		);
		if ($this->hours_clock == 24) {
			$hours_set = array_merge($hours_set, array(
					'13:00',
					'13:30',
					'14:00',
					'14:30',
					'15:00',
					'15:30',
					'16:00',
					'16:30',
					'17:00',
					'17:30',
					'18:00',
					'18:30',
					'19:00',
					'19:30',
					'20:00',
					'20:30',
					'21:00',
					'21:30',
					'22:00',
					'23:30',
					'23:00',
			));
		}
		
		$hours_set = apply_filters('w2dc_hours_set', $hours_set);
		
		$result = '';
		foreach ($hours_set AS $hours_minutes) {
			$result .= '<option ' . selected($hours_minutes, $hour, false) . '>' . $hours_minutes . '</option>';
		}
		return $result;
	}

	public function getOptionsAmPm($index) {
		if (stripos($this->value[$index], 'am') !== FALSE) {
			$am_pm = 'AM';
		} elseif (stripos($this->value[$index], 'pm') !== FALSE) {
			$am_pm = 'PM';
		} else { 
			$am_pm = '';
		}
		$result = '';
		$result .= '<option ' . selected(__('AM', 'W2DC'), $am_pm, false) . '>' . __('AM', 'W2DC') . '</option>';
		$result .= '<option ' . selected(__('PM', 'W2DC'), $am_pm, false) . '>' . __('PM', 'W2DC') . '</option>';
		return $result;
	}
	
	public function validateCsvValues($value, &$errors) {
		$values = array_filter(array_map('trim', explode(',', $value)));
		$value = array();
		$processed_days = array();
		$processed = false;
		foreach ($values AS $item) {
			if ($this->hours_clock == 12) {
				// only 00 or 30 minutes
				preg_match("/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(0[0-9]|1[0-2]):([0|3]0)\s(AM|PM)\s-\s(0[0-9]|1[0-2]):([0|3]0)\s(AM|PM)/i", $item, $matches);
				$length_required = 8;
			} elseif ($this->hours_clock == 24) {
				preg_match("/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s(0[0-9]|1[0-9]|2[0-3]):([0|3]0)\s-\s(0[0-9]|1[0-9]|2[0-3]):([0|3]0)/i", $item, $matches);
				$length_required = 6;
			}
			if ($matches && count($matches) == $length_required && in_array(strtolower($matches[1]), $this->week_days)) {
				$day = strtolower($matches[1]);
				$processed_days[] = $day;
				$processed = true;
				if ($this->hours_clock == 12) {
					$value[$day.'_from'] = $matches[2].':'.$matches[3].' '.strtoupper($matches[4]);
					$value[$day.'_to'] = $matches[5].':'.$matches[6].' '.strtoupper($matches[7]);
				} elseif ($this->hours_clock == 24) {
					$value[$day.'_from'] = $matches[2].':'.$matches[3];
					$value[$day.'_to'] = $matches[4].':'.$matches[5];
				}
			} else 
				$errors[] = __("Opening hours field value does not match required format", 'W2DC');
		}
		foreach ($this->week_days AS $day) {
			if (in_array($day, $processed_days))
				$value[$day.'_closed'] = 0;
			else
				$value[$day.'_closed'] = 1;
		}
		if (!$processed)
			$value = '';
		
		return $value;
	}
	
	public function exportCSV() {
		$week_days = $this->orderWeekDays();

		$output = array();
		foreach ($week_days AS $key=>$day) {
			if ($this->value[$day.'_from'] || $this->value[$day.'_to'] || $this->value[$day.'_closed']) {
				if (!$this->value[$day.'_closed']) {
					$output[] = ucfirst($this->week_days[$key]) . ' ' .  $this->value[$day.'_from'] . ' - ' . $this->value[$day.'_to'];
				} else {
					$output[] = '';
				}
			}
		}
		
		$output = array_filter($output);

		if ($output)
			return  implode(',', $output);
	}
}
?>