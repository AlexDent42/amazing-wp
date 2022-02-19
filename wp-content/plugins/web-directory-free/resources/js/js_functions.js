var w2dc_maps = [];
var w2dc_maps_attrs = [];
var w2dc_infoWindows = [];
var w2dc_drawCircles = [];
var w2dc_searchAddresses = [];
var w2dc_polygons = [];
var w2dc_fullScreens = [];
var w2dc_global_markers_array = [];
var w2dc_global_locations_array = [];
var w2dc_markerClusters = [];
var w2dc_directions_display = [];
var w2dc_stop_touchmove_listener = function(e){
	e.preventDefault();
}
var w2dc_glocation = (function(id, point, map_icon_file, map_icon_color, listing_title, listing_logo, listing_url, content_fields, anchor, nofollow, show_summary_button, show_readmore_button, map_id, is_ajax_markers) {
	this.id = id;
	this.point = point;
	this.map_icon_file = map_icon_file;
	this.map_icon_color = map_icon_color;
	this.listing_title = listing_title;
	this.listing_logo = listing_logo;
	this.listing_url = listing_url;
	this.content_fields = content_fields;
	this.anchor = anchor;
	this.nofollow = nofollow;
	this.show_summary_button = show_summary_button;
	this.show_readmore_button = show_readmore_button;
	this.w2dc_placeMarker = function(map_id) {
		this.marker = w2dc_placeMarker(this, map_id);
		return this.marker;
	};
	this.is_ajax_markers = is_ajax_markers;
});
var _w2dc_map_markers_attrs_array;
var w2dc_dragended;
var ZOOM_FOR_SINGLE_MARKER = 17;

var w2dc_map_backend = null;
var w2dc_allow_map_zoom_backend = true; // allow/disallow map zoom in listener, this option needs because w2dc_map_backend.setZoom() also calls this listener
var w2dc_geocoder_backend = null;
var w2dc_infoWindow_backend = null;
var w2dc_markersArray_backend = [];
var w2dc_glocation_backend = (function(index, point, location, address_line_1, address_line_2, zip_or_postal_index, map_icon_file) {
	this.index = index;
	this.point = point;
	this.location = location;
	this.address_line_1 = address_line_1;
	this.address_line_2 = address_line_2;
	this.zip_or_postal_index = zip_or_postal_index;
	this.map_icon_file = map_icon_file;
	this.w2dc_placeMarker = function() {
		return w2dc_placeMarker_backend(this);
	};
	this.compileAddress = function() {
		var address = this.address_line_1;
		if (this.address_line_2)
			address += ", "+this.address_line_2;
		if (this.location) {
			if (address)
				address += " ";
			address += this.location;
		}
		if (w2dc_maps_objects.default_geocoding_location) {
			if (address)
				address += " ";
			address += w2dc_maps_objects.default_geocoding_location;
		}
		if (this.zip_or_postal_index) {
			if (address)
				address += " ";
			address += this.zip_or_postal_index;
		}
		return address;
	};
	this.compileHtmlAddress = function() {
		var address = this.address_line_1;
		if (this.address_line_2)
			address += ", "+this.address_line_2;
		if (this.location) {
			if (this.address_line_1 || this.address_line_2)
				address += "<br />";
			address += this.location;
		}
		if (this.zip_or_postal_index)
			address += " "+this.zip_or_postal_index;
		return address;
	};
	this.setPoint = function(point) {
		this.point = point;
	};
});

/* Stack-based Douglas Peucker line simplification routine 
returned is a reduced GLatLng array 
After code by  Dr. Gary J. Robinson,
Environmental Systems Science Centre,
University of Reading, Reading, UK
*/
function w2dc_GDouglasPeucker(source, kink) {
	var n_source, n_stack, n_dest, start, end, i, sig;    
	var dev_sqr, max_dev_sqr, band_sqr;
	var x12, y12, d12, x13, y13, d13, x23, y23, d23;
	var F = ((Math.PI / 180.0) * 0.5 );
	var index = new Array();
	var sig_start = new Array();
	var sig_end = new Array();

	if ( source.length < 3 ) 
		return(source);

	n_source = source.length;
	band_sqr = kink * 360.0 / (2.0 * Math.PI * 6378137.0);
	band_sqr *= band_sqr;
	n_dest = 0;
	sig_start[0] = 0;
	sig_end[0] = n_source-1;
	n_stack = 1;

	while ( n_stack > 0 ) {
		start = sig_start[n_stack-1];
		end = sig_end[n_stack-1];
		n_stack--;

		if ( (end - start) > 1 ) {
			x12 = (source[end].lng() - source[start].lng());
			y12 = (source[end].lat() - source[start].lat());
			if (Math.abs(x12) > 180.0) 
				x12 = 360.0 - Math.abs(x12);
			x12 *= Math.cos(F * (source[end].lat() + source[start].lat()));
			d12 = (x12*x12) + (y12*y12);

			for ( i = start + 1, sig = start, max_dev_sqr = -1.0; i < end; i++ ) {                                    
				x13 = (source[i].lng() - source[start].lng());
				y13 = (source[i].lat() - source[start].lat());
				if (Math.abs(x13) > 180.0) 
					x13 = 360.0 - Math.abs(x13);
				x13 *= Math.cos (F * (source[i].lat() + source[start].lat()));
				d13 = (x13*x13) + (y13*y13);

				x23 = (source[i].lng() - source[end].lng());
				y23 = (source[i].lat() - source[end].lat());
				if (Math.abs(x23) > 180.0) 
					x23 = 360.0 - Math.abs(x23);
				x23 *= Math.cos(F * (source[i].lat() + source[end].lat()));
				d23 = (x23*x23) + (y23*y23);

				if ( d13 >= ( d12 + d23 ) )
					dev_sqr = d23;
				else if ( d23 >= ( d12 + d13 ) )
					dev_sqr = d13;
				else
					dev_sqr = (x13 * y12 - y13 * x12) * (x13 * y12 - y13 * x12) / d12;// solve triangle

				if ( dev_sqr > max_dev_sqr  ){
					sig = i;
					max_dev_sqr = dev_sqr;
				}
			}

			if ( max_dev_sqr < band_sqr ) {
				index[n_dest] = start;
				n_dest++;
			} else {
				n_stack++;
				sig_start[n_stack-1] = sig;
				sig_end[n_stack-1] = end;
				n_stack++;
				sig_start[n_stack-1] = start;
				sig_end[n_stack-1] = sig;
			}
		} else {
			index[n_dest] = start;
			n_dest++;
		}
	}
	index[n_dest] = n_source-1;
	n_dest++;

	var r = new Array();
	for(var i=0; i < n_dest; i++)
		r.push(source[index[i]]);

	return r;
}

(function($) {
	"use strict";
	
	$(function() {
		
		window.w2dc_nice_scroll = function() {
			// do not use niceScroll on mobiles 
			if (!$("body").hasClass("w2dc-touch")) {
				var nice_scroll_params = {
						cursorcolor: "#bdbdbd",
						cursorborderradius: "2px",
						cursorwidth: "7px",
						autohidemode: false
				}
				if ($(".w2dc-map-listings-panel").length) {
					$(".w2dc-map-listings-panel").niceScroll(nice_scroll_params);
				}
				if ($(".w2dc-dropdowns-menu").length) {
					$(".w2dc-dropdowns-menu").niceScroll(nice_scroll_params);
				}
			}
		}
		
		w2dc_add_body_classes();
		w2dc_get_rid_of_select2_choosen();
		w2dc_process_main_search_fields();
		w2dc_nice_scroll();
		w2dc_custom_input_controls();
		w2dc_my_location_buttons();
		w2dc_tokenizer();
		w2dc_equalColumnsHeight();
		w2dc_equalColumnsHeightEvent();
		w2dc_listings_carousel();
		w2dc_radius_slider();
		w2dc_hint();
		w2dc_favourites();
		w2dc_week_day_input();
		w2dc_check_is_week_day_closed();
		w2dc_listing_tabs();
		w2dc_dashboard_tabs();
		w2dc_sticky_scroll();
		w2dc_tooltips();
		w2dc_ratings();
		w2dc_hours_content_field();
		w2dc_full_height_maps();
		w2dc_load_comments();
		w2dc_content_fields_metabox();
		w2dc_upload_image();
		w2dc_media_metabox();
		w2dc_locations_metabox();
		w2dc_datetime_input();
		w2dc_expiration_date_metabox();
		w2dc_add_term_links();
		w2dc_sort_terms();
	});

	window.w2dc_sort_terms = function() {
		if (typeof w2dc_order_term_data != 'undefined') {
			var base_index = parseInt(w2dc_order_term_data.paged) > 0 ? (parseInt(w2dc_order_term_data.paged) - 1) * parseInt($('#'+w2dc_order_term_data.per_page_id).val()) : 0;
			var tax_table  = $('#the-list');
		
			// If the tax table contains items.
			if (tax_table.length && !tax_table.find('tr:first-child').hasClass('no-items')) {
				
				tax_table.sortable({
					placeholder: "w2dc-drag-drop-tax-placeholder",
					axis: "y",
		
					// On start, set a height for the placeholder to prevent table jumps.
					start: function(event, ui) {
						const item  = $(ui.item[0]);
						const index = item.index();
						const colspan = item.children('th,td').filter(':visible').length;
						$('.w2dc-drag-drop-tax-placeholder')
						.css('height', item.css('height'))
						.css('display', 'flex')
						.css('width', '0');
					},
					update: function(event, ui) {
						var item = $(ui.item[0]);
						var taxonomy_ordering_data = [];
		
						tax_table.find('tr.ui-sortable-handle').each(function() {
							var ele = $(this);
							var term_data = {
								term_id: ele.attr('id').replace('tag-', ''),
								order: parseInt(ele.index()) + 1
							}
							taxonomy_ordering_data.push(term_data);
						});
						
						var data = {
							'action': 'w2dc_update_tax_order',
							'taxonomy_ordering_data': taxonomy_ordering_data,
							'base_index': base_index,
							'term_order_nonce': w2dc_order_term_data.term_order_nonce
						};
						
						$.ajax({
							type: 'POST',
							url: w2dc_js_objects.ajaxurl,
							data: data,
							dataType: 'JSON',
							success: function(response) {
								item.find('input[type="checkbox"]').show();
							}
						});
					}
				});
			}
		}
	}
	
	window.w2dc_upload_image = function() {
		$(document).on("click", ".w2dc-reset-image-button", function(e) {
			e.preventDefault();
			
			var form = $(this).parents(".w2dc-upload-image-form");
			form.parent().find(".w2dc-upload-image").css("background-image", "");
			form.parent().find('.w2dc-upload-image-input-' + form.data('name')).val("");
		});
		if (w2dc_js_objects.is_admin) {
			$(document).on('click', '.w2dc-upload-image-button', function(event) {
				event.preventDefault();
		
				var form = $(this).parents(".w2dc-upload-image-form");
				var frame = wp.media({
					title : w2dc_js_objects.media_dialog_title,
					multiple : false,
					library : { type : 'image'},
					button : { text : w2dc_js_objects.media_dialog_button_text},
				});
				frame.on('select', function() {
					var selected_images = [];
					var selection = frame.state().get('selection');
					selection.each(function(attachment) {
						attachment = attachment.toJSON();
						if (attachment.type == 'image') {
							
							var image_url = attachment.sizes.full.url;
							var attachment_id = attachment.id;
							form.find('.w2dc-upload-image').css("background-image", "url(" + image_url + ")");
							form.find('.w2dc-upload-image-input-' + form.data('name')).val(attachment_id);
						}
					
					});
				});
				frame.open();
			});
		} else {
			$(document).on("click", ".w2dc-upload-image-button", function(e) {
				e.preventDefault();
				
				$(this).parent().find("input").click();
			});
			$('.w2dc-upload-image-form').each(function() {
				var form = $(this);
				var action_url = form.data('action-url');
				form.fileupload({
					dataType: 'json',
					url: action_url,
					send: function (e, data) {
						w2dc_add_iloader_on_element(form);
					},
					done: function(e, data) {
						var result = data.result;
						if (result.uploaded_file) {
							var size = result.metadata.size;
							var width = result.metadata.width;
							var height = result.metadata.height;
							form.find('.w2dc-upload-image').css("background-image", "url(" + result.uploaded_file + ")");
							form.find('.w2dc-upload-image-input-' + form.data('name')).val(result.attachment_id);
						} else {
							form.find('.w2dc-upload-image').append("<p>"+result.error_msg+"</p>");
						}
						w2dc_delete_iloader_from_element(form);
					}
				});
			});
		}
	}

	window.w2dc_add_term_links = function() {
		$(document).on("click", ".w2dc-add-term-link", function(e) {
			e.preventDefault();
			
			var el = $(this);
			var tax = el.data('tax');
			var uid = el.data('uid');
			var exact_terms = el.data('exact-terms');
			var parent_id = el.data('parent');
			var nonce = el.data('nonce');
			var label = el.html();
			var saved_html = el[0].outerHTML;

			var add_form = $('<form class="w2dc-add-term-form"><input name="w2dc_add_term_input" class="w2dc-form-control w2dc-add-term-input" value="" /><a class="w2dc-btn w2dc-btn-primary w2dc-add-term-button">'+label+'</a> <a class="w2dc-btn w2dc-btn-primary w2dc-add-term-cancel">'+w2dc_js_objects.cancel_button+'</a></form>');
			add_form.on("submit", function(e) {
				e.preventDefault();
				
				$(add_form).find('.w2dc-add-term-button').trigger('click');
			});
			el.replaceWith(add_form);
			
			$(add_form).find('.w2dc-add-term-input').focus();
			
			$(add_form).on("click", ".w2dc-add-term-cancel", function(e) {
				e.preventDefault();
				
				$(this).parent().replaceWith(saved_html);
			});
			
			$(add_form).on("click", ".w2dc-add-term-button", function(e) {
				e.preventDefault();
				
				var input = $(this).parent().find('.w2dc-add-term-input');
				if (input.val()) {
					w2dc_ajax_loader_show();
					
					$.ajax({
						type: "POST",
						url: w2dc_js_objects.ajaxurl,
						data: { 
							'action': 'w2dc_add_term',
							'tax': tax,
							'parent_id': parent_id,
							'val': input.val(),
							'security': nonce
						},
						success: function(term_id){
							
							term_id = $.trim(term_id);
							
							if (term_id != 0) {
								$(add_form).find('.w2dc-add-term-cancel').trigger('click');
								
								w2dc_update_tax_wrapper(tax, uid, exact_terms, term_id);
							}
						},
						complete: function() {
							
						}
					});
				}
			});
		});
	}
	
	window.w2dc_update_tax_wrapper = function(tax, uid, exact_terms, selected_term) {
		var wrapper = $('div.'+tax);
		
		$.ajax({
			type: "POST",
			url: w2dc_js_objects.ajaxurl,
			data: { 'action': 'w2dc_update_tax_wrapper', 'tax': tax, 'exact_terms': exact_terms, 'selected_term': selected_term, 'uid': uid },
			success: function(response_from_the_action_function){
				if (response_from_the_action_function != 0) {
					wrapper.html('').append(response_from_the_action_function);
				}
			},
			complete: function() {
				w2dc_ajax_loader_hide();
			}
		});
	}
	
	window.w2dc_expiration_date_metabox = function() {
		if (typeof w2dc_expiration_date_metabox_attrs != 'undefined') {
			$("#expiration_date").datepicker({
				changeMonth: true,
				changeYear: true,
				isRTL: w2dc_expiration_date_metabox_attrs.isRTL,
				showButtonPanel: true,
				dateFormat: w2dc_expiration_date_metabox_attrs.dateFormat,
				firstDay: w2dc_expiration_date_metabox_attrs.firstDay,
				onSelect: function(dateText) {
					var tmstmp_str;
					var sDate = $("#expiration_date").datepicker("getDate");
					if (sDate) {
						sDate.setMinutes(sDate.getMinutes() - sDate.getTimezoneOffset());
						tmstmp_str = $.datepicker.formatDate('@', sDate)/1000;
					} else {
						tmstmp_str = 0;
					}
	
					$("input[name=expiration_date_tmstmp]").val(tmstmp_str);
				}
			});
			if (w2dc_expiration_date_metabox_attrs.lang_code) {
				$("#expiration_date").datepicker($.datepicker.regional[w2dc_expiration_date_metabox_attrs.lang_code]);
			}
	
			$("#expiration_date").datepicker('setDate', $.datepicker.parseDate('dd/mm/yy', w2dc_expiration_date_metabox_attrs.expiration_date_formatted));
		}
	}
	
	window.w2dc_datetime_input = function() {
		if (typeof w2dc_datetime_input_attrs != 'undefined') {
			
			$.each(w2dc_datetime_input_attrs, function (index, field_attrs) {
				var field_id = field_attrs.field_id;
				
				$("#w2dc-field-input-" + field_id + "-start").datepicker({
					changeMonth: true,
					changeYear: true,
					isRTL: field_attrs.isRTL,
					showButtonPanel: true,
					dateFormat: field_attrs.dateFormat,
					firstDay: field_attrs.firstDay,
					onSelect: function(dateText) {
						var tmstmp_str;
						var sDate = $("#w2dc-field-input-" + field_id + "-start").datepicker("getDate");
						if (sDate) {
							sDate.setMinutes(sDate.getMinutes() - sDate.getTimezoneOffset());
							tmstmp_str = $.datepicker.formatDate('@', sDate)/1000;
						} else {
							tmstmp_str = 0;
						}
						$("#w2dc-field-input-" + field_id + "-end").datepicker('option', 'minDate', sDate);
		
						$("input[name=w2dc-field-input-" + field_id + "-start]").val(tmstmp_str);
					}
				});
				if (field_attrs.lang_code) {
					$("#w2dc-field-input-" + field_id + "-start").datepicker($.datepicker.regional[field_attrs.lang_code]);
				}
				
				$("#w2dc-field-input-" + field_id + "-end").datepicker({
					changeMonth: true,
					changeYear: true,
					isRTL: field_attrs.isRTL,
					showButtonPanel: true,
					dateFormat: field_attrs.dateFormat,
					firstDay: field_attrs.firstDay,
					onSelect: function(dateText) {
						var tmstmp_str;
						var sDate = $("#w2dc-field-input-" + field_id + "-end").datepicker("getDate");
						if (sDate) {
							sDate.setMinutes(sDate.getMinutes() - sDate.getTimezoneOffset());
							tmstmp_str = $.datepicker.formatDate('@', sDate)/1000;
						} else {
							tmstmp_str = 0;
						}
						$("#w2dc-field-input-" + field_id + "-start").datepicker('option', 'maxDate', sDate);
		
						$("input[name=w2dc-field-input-" + field_id + "-end]").val(tmstmp_str);
					}
				});
				if (field_attrs.lang_code) {
					$("#w2dc-field-input-" + field_id + "-end").datepicker($.datepicker.regional[field_attrs.lang_code]);
				}

				if (field_attrs.date_end) {
					$("#w2dc-field-input-" + field_id + "-end").datepicker('setDate', $.datepicker.parseDate('dd/mm/yy', field_attrs.date_end_formatted));
					$("#w2dc-field-input-" + field_id + "-start").datepicker('option', 'maxDate', $("#w2dc-field-input-" + field_id + "-end").datepicker('getDate'));
				}
				$('body').on('click', "#w2dc-reset-date-" + field_id + "-end", function() {
					$.datepicker._clearDate("#w2dc-field-input-" + field_id + "-end");
				})

				if (field_attrs.date_start) {
					$("#w2dc-field-input-" + field_id + "-start").datepicker('setDate', $.datepicker.parseDate('dd/mm/yy', field_attrs.date_start_formatted));
					$("#w2dc-field-input-" + field_id + "-end").datepicker('option', 'minDate', $("#w2dc-field-input-" + field_id + "-start").datepicker('getDate'));
				}
				$('body').on('click', "#w2dc-reset-date-" + field_id + "-start", function() {
					$.datepicker._clearDate("#w2dc-field-input-" + field_id + "-start");
				})
			});
		}
	}
	
	window.w2dc_locations_metabox = function() {
		if (typeof w2dc_locations_metabox_attrs != 'undefined') {
			if (w2dc_locations_metabox_attrs.is_map_markers) {
				if (w2dc_maps_objects.map_markers_type == 'images') {
					var map_icon_file_input;
					$(document).on("click", ".w2dc-select-map-icon", function() {
						map_icon_file_input = $(this).parents(".w2dc-location-input").find('.w2dc-map-icon-file');
			
						var dialog = $('<div id="w2dc-select-map-icon-dialog"></div>').dialog({
							dialogClass: 'w2dc-content',
							width: ($(window).width()*0.5),
							height: ($(window).height()*0.8),
							modal: true,
							resizable: false,
							draggable: false,
							title: w2dc_locations_metabox_attrs.images_dialog_title,
							open: function() {
								w2dc_ajax_loader_show();
								$.ajax({
									type: "POST",
									url: w2dc_js_objects.ajaxurl,
									data: {'action': 'w2dc_select_map_icon'},
									dataType: 'html',
									success: function(response_from_the_action_function){
										if (response_from_the_action_function != 0) {
											$('#w2dc-select-map-icon-dialog').html(response_from_the_action_function);
											if (map_icon_file_input.val())
												$(".w2dc-icon[icon_file='"+map_icon_file_input.val()+"']").addClass("w2dc-selected-icon");
										}
									},
									complete: function() {
										w2dc_ajax_loader_hide();
									}
								});
								$(document).on("click", ".ui-widget-overlay", function() { $('#w2dc-select-map-icon-dialog').remove(); });
							},
							close: function() {
								$('#w2dc-select-map-icon-dialog').remove();
							}
						});
					});
					$(document).on("click", ".w2dc-icon", function() {
						$(".w2dc-selected-icon").removeClass("w2dc-selected-icon");
						if (map_icon_file_input) {
							map_icon_file_input.val($(this).attr('icon_file'));
							map_icon_file_input = false;
							$(this).addClass("w2dc-selected-icon");
							$('#w2dc-select-map-icon-dialog').remove();
							w2dc_generateMap_backend();
						}
					});
					$(document).on("click", "#reset_icon", function() {
						if (map_icon_file_input) {
							$(".w2dc-selected-icon").removeClass("w2dc-selected-icon");
							map_icon_file_input.val('');
							map_icon_file_input = false;
							$('#w2dc-select-map-icon-dialog').remove();
							w2dc_generateMap_backend();
						}
					});
				} else {
					var map_icon_file_input;
					$(document).on("click", ".w2dc-select-map-icon", function() {
						map_icon_file_input = $(this).parents(".w2dc-location-input").find('.w2dc-map-icon-file');
		
						var dialog = $('<div id="select_marker_icon_dialog"></div>').dialog({
							dialogClass: 'w2dc-content',
							width: ($(window).width()*0.5),
							height: ($(window).height()*0.8),
							modal: true,
							resizable: false,
							draggable: false,
							title: w2dc_locations_metabox_attrs.icons_dialog_title,
							open: function() {
								w2dc_ajax_loader_show();
								$.ajax({
									type: "POST",
									url: w2dc_js_objects.ajaxurl,
									data: {'action': 'w2dc_select_fa_icon'},
									dataType: 'html',
									success: function(response_from_the_action_function){
										if (response_from_the_action_function != 0) {
											$('#select_marker_icon_dialog').html(response_from_the_action_function);
											if (map_icon_file_input.val())
												$("#"+map_icon_file_input.val()).addClass("w2dc-selected-icon");
										}
									},
									complete: function() {
										w2dc_ajax_loader_hide();
									}
								});
								$(document).on("click", ".ui-widget-overlay", function() { $('#select_marker_icon_dialog').remove(); });
							},
							close: function() {
								$('#select_marker_icon_dialog').remove();
							}
						});
					});
					$(document).on("click", ".w2dc-fa-icon", function() {
						$(".w2dc-selected-icon").removeClass("w2dc-selected-icon");
						if (map_icon_file_input) {
							map_icon_file_input.val($(this).attr('id'));
							map_icon_file_input = false;
							$(this).addClass("w2dc-selected-icon");
							$('#select_marker_icon_dialog').remove();
							w2dc_generateMap_backend();
						}
					});
					$(document).on("click", "#w2dc-reset-fa-icon", function() {
						if (map_icon_file_input) {
							$(".w2dc-selected-icon").removeClass("w2dc-selected-icon");
							map_icon_file_input.val('');
							map_icon_file_input = false;
							$('#select_marker_icon_dialog').remove();
							w2dc_generateMap_backend();
						}
					});
				}
			}
			
			$('body').on('click', ".add_address", function() {
				w2dc_ajax_loader_show();
				$.ajax({
					type: "POST",
					url: w2dc_js_objects.ajaxurl,
					data: { 'action': 'w2dc_add_location_in_metabox', 'post_id': w2dc_locations_metabox_attrs.post_id },
					success: function(response_from_the_action_function){
						if (response_from_the_action_function != 0) {
							$("#w2dc-locations-wrapper").append(response_from_the_action_function);
							$(".w2dc-delete-address").show();
							if (w2dc_locations_metabox_attrs.locations_number == $(".w2dc-location-in-metabox").length) {
								$(".add_address").hide();
							}
							if (w2dc_maps_objects.address_autocomplete && w2dc_js_objects.is_maps_used) {
								w2dc_setupAutocomplete();
							}
						}
					},
					complete: function() {
						w2dc_ajax_loader_hide();
					}
				});
			});
			$(document).on("click", ".w2dc-delete-address", function() {
				$(this).parents(".w2dc-location-in-metabox").remove();
				if ($(".w2dc-location-in-metabox").length == 1)
					$(".w2dc-delete-address").hide();
	
				if (w2dc_locations_metabox_attrs.is_map) {
					w2dc_generateMap_backend();
				}
	
				if (w2dc_locations_metabox_attrs.locations_number > $(".w2dc-location-in-metabox").length)
					$(".add_address").show();
			});
	
			$(document).on("click", ".w2dc-manual-coords", function() {
	        	if ($(this).is(":checked"))
	        		$(this).parents(".w2dc-manual-coords-wrapper").find(".w2dc-manual-coords-block").slideDown(200);
	        	else
	        		$(this).parents(".w2dc-manual-coords-wrapper").find(".w2dc-manual-coords-block").slideUp(200);
	        });
	
	        if (w2dc_locations_metabox_attrs.locations_number > $(".w2dc-location-in-metabox").length) {
				$(".add_address").show();
	        }
		}
	}
	
	window.w2dc_media_metabox = function() {
		if ($('#w2dc-images-upload-wrapper').length) {

			window.w2dc_image_attachment_tpl = function(attachment_id, uploaded_file, title, size, width, height) {
				var image_attachment_tpl = '<div class="w2dc-attached-item w2dc-move-label">' +
						'<input type="hidden" name="attached_image_id[]" class="w2dc-attached-item-id" value="'+attachment_id+'" />' +
						'<a href="'+uploaded_file+'" data-w2dc_lightbox="listing_images" class="w2dc-attached-item-img" style="background-image: url('+uploaded_file+')"></a>' +
						'<div class="w2dc-attached-item-input">' +
							'<input type="text" name="attached_image_title[]" class="w2dc-form-control" value="" placeholder="' + w2dc_media_metabox_attrs.images_input_placeholder + '" />' +
						'</div>';
						if (w2dc_media_metabox_attrs.images_logo_enabled) {
							image_attachment_tpl = image_attachment_tpl + '<div class="w2dc-attached-item-logo w2dc-radio">' +
							'<label>' +
								'<input type="radio" name="attached_image_as_logo" value="'+attachment_id+'"> ' + w2dc_media_metabox_attrs.images_input_label +
							'</label>' +
							'</div>';
						}
						image_attachment_tpl = image_attachment_tpl + '<div class="w2dc-attached-item-delete w2dc-fa w2dc-fa-trash-o" title="' + w2dc_media_metabox_attrs.images_remove_title + '"></div>' +
						'<div class="w2dc-attached-item-metadata">'+size+' ('+width+' x '+height+')</div>' +
					'</div>';

				return image_attachment_tpl;
			};

			window.w2dc_update_images_attachments_order = function() {
				$("#w2dc-attached-images-order").val($(".w2dc-attached-item-id").map(function() {
					return $(this).val();
				}).get());
			}
			window.w2dc_check_images_attachments_number = function() {
				if (w2dc_media_metabox_attrs.images_number > $("#w2dc-images-upload-wrapper .w2dc-attached-item").length) {
					if (w2dc_js_objects.is_admin) {
						$("#w2dc-admin-upload-functions").show();
					} else {
						$(".w2dc-upload-item").show();
					}
					return true;
				} else {
					if (w2dc_js_objects.is_admin) {
						$("#w2dc-admin-upload-functions").hide();
					} else {
						$(".w2dc-upload-item").hide();
					}
					return false;
				}
			}

			
		    var sortable_images = $("#w2dc-attached-images-wrapper").sortable({
			    delay: 50,
		    	placeholder: "ui-sortable-placeholder",
		    	items: ".w2dc-attached-item",
				helper: function(e, ui) {
					ui.children().each(function() {
						$(this).width($(this).width());
					});
					return ui;
				},
				start: function(e, ui){
					ui.placeholder.width(ui.item.width());
					ui.placeholder.height(ui.item.height());
				},
				update: function( event, ui ) {
					w2dc_update_images_attachments_order();
				}
			});

		    // disable sortable on android, otherwise it breaks click events on image, radio and delete button
		    var ua = navigator.userAgent.toLowerCase();
		    if (ua.indexOf("android") > -1) {
				sortable_images.sortable("disable");
			};

			w2dc_check_images_attachments_number();

			$("#w2dc-attached-images-wrapper").on("click", ".w2dc-attached-item-delete", function() {
				$(this).parents(".w2dc-attached-item").remove();
				
				$.ajax({
					url: w2dc_js_objects.ajaxurl,
					type: "POST",
					dataType: "json",
					data: {
						action: 'w2dc_remove_image',
						post_id: w2dc_media_metabox_attrs.object_id,
						attachment_id: $(this).parent().find(".w2dc-attached-item-id").val(),
						_wpnonce: w2dc_media_metabox_attrs.images_remove_image_nonce
					}
				});
		
				w2dc_check_images_attachments_number();
				w2dc_update_images_attachments_order();
			});

			if (!w2dc_js_objects.is_admin) {
				$(document).on("click", ".w2dc-upload-item-button", function(e){
					e.preventDefault();
					
					$(this).parent().find("input").click();
				});
	
				$('.w2dc-upload-item').fileupload({
					sequentialUploads: true,
					dataType: 'json',
					url: w2dc_media_metabox_attrs.images_fileupload_url,
					dropZone: $('.w2dc-drop-attached-item'),
					add: function (e, data) {
						if (w2dc_check_images_attachments_number()) {
							var jqXHR = data.submit();
						} else {
							return false;
						}
					},
					send: function (e, data) {
						w2dc_add_iloader_on_element($(this).find(".w2dc-drop-attached-item"));
					},
					done: function(e, data) {
						var result = data.result;
						if (result.uploaded_file) {
							var size = result.metadata.size;
							var width = result.metadata.width;
							var height = result.metadata.height;
							$(this).before(w2dc_image_attachment_tpl(result.attachment_id, result.uploaded_file, data.files[0].name, size, width, height));
							w2dc_custom_input_controls();
						} else {
							$(this).find(".w2dc-drop-attached-item").append("<p>"+result.error_msg+"</p>");
						}
						$(this).find(".w2dc-drop-zone").show();
						w2dc_delete_iloader_from_element($(this).find(".w2dc-drop-attached-item"));
						
						w2dc_check_images_attachments_number();
						w2dc_update_images_attachments_order();
					}
				});
			}
			
			if (w2dc_media_metabox_attrs.images_is_admin) {
				$('body').on('click', '#w2dc-admin-upload-image', function(event) {
					event.preventDefault();
			
					var frame = wp.media({
						title : w2dc_media_metabox_attrs.images_upload_image_title,
						multiple : true,
						library : { type : 'image'},
						button : { text : w2dc_media_metabox_attrs.images_upload_image_button},
					});
					frame.on('select', function() {
						var selected_images = [];
						var selection = frame.state().get('selection');
						selection.each(function(attachment) {
							attachment = attachment.toJSON();
							if (attachment.type == 'image') {
					
								if (w2dc_check_images_attachments_number()) {
									w2dc_ajax_loader_show();
			
									$.ajax({
										type: "POST",
										async: false,
										url: w2dc_js_objects.ajaxurl,
										data: {
											'action': 'w2dc_upload_media_image',
											'attachment_id': attachment.id,
											'post_id': w2dc_media_metabox_attrs.object_id,
											'_wpnonce': w2dc_media_metabox_attrs.images_upload_image_nonce,
										},
										attachment_id: attachment.id,
										attachment_url: attachment.sizes.full.url,
										attachment_title: attachment.title,
										dataType: "json",
										success: function (response_from_the_action_function) {
											if (response_from_the_action_function != 0) {
												var size = response_from_the_action_function.metadata.size;
												var width = response_from_the_action_function.metadata.width;
												var height = response_from_the_action_function.metadata.height;
												$("#w2dc-attached-images-wrapper").append(w2dc_image_attachment_tpl(this.attachment_id, this.attachment_url, this.attachment_title, size, width, height));
												w2dc_check_images_attachments_number();
												w2dc_update_images_attachments_order();
											}
												
											w2dc_ajax_loader_hide();
										}
									});
								}
							}
						
						});
					});
					frame.open();
				});
			}
		}
		
		if ($('#w2dc-attach-videos-functions').length) {
			window.w2dc_video_attachment_tpl = function(video_id, image_url) {
				var video_attachment_tpl = '<div class="w2dc-attached-item">' +
					'<input type="hidden" name="attached_video_id[]" value="'+video_id+'" />' +
					'<div class="w2dc-attached-item-img" style="background-image: url('+image_url+')"></div>' +
					'<div class="w2dc-attached-item-delete w2dc-fa w2dc-fa-trash-o" title="' + w2dc_media_metabox_attrs.videos_delete_title + '"></div>' +
				'</div>';

				return video_attachment_tpl;
			};

			window.w2dc_check_videos_attachments_number = function() {
				if (w2dc_media_metabox_attrs.videos_number > $("#w2dc-attached-videos-wrapper .w2dc-attached-item").length) {
					$("#w2dc-attach-videos-functions").show();
				} else {
					$("#w2dc-attach-videos-functions").hide();
				}
			}

			w2dc_check_videos_attachments_number();

			$("#w2dc-attached-videos-wrapper").on("click", ".w2dc-attached-item-delete", function() {
				$(this).parents(".w2dc-attached-item").remove();
	
				w2dc_check_videos_attachments_number();
			});
			
			window.attachVideo = function() {
				if ($("#w2dc-attach-video-input").val()) {
					var regExp_youtube = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
					var regExp_vimeo = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
					var matches_youtube = $("#w2dc-attach-video-input").val().match(regExp_youtube);
					var matches_vimeo = $("#w2dc-attach-video-input").val().match(regExp_vimeo);
					if (matches_youtube && matches_youtube[2].length == 11) {
						var video_id = matches_youtube[2];
						var image_url = 'http://i.ytimg.com/vi/'+video_id+'/0.jpg';
						$("#w2dc-attached-videos-wrapper").append(w2dc_video_attachment_tpl(video_id, image_url));

						w2dc_check_videos_attachments_number();
					} else if (matches_vimeo && (matches_vimeo[3].length == 8 || matches_vimeo[3].length == 9)) {
						var video_id = matches_vimeo[3];
						var url = "//vimeo.com/api/v2/video/" + video_id + ".json?callback=showVimeoThumb";
					    var script = document.createElement('script');
					    script.src = url;
					    $("#w2dc-attach-videos-functions").before(script);
					} else {
						alert(w2dc_media_metabox_attrs.videos_error_alert);
					}
				}
			};

			window.showVimeoThumb = function(data){
				var video_id = data[0].id;
			    var image_url = data[0].thumbnail_medium;
			    $("#w2dc-attached-videos-wrapper").append(w2dc_video_attachment_tpl(video_id, image_url));

			    w2dc_check_videos_attachments_number();
			};
		}
	}
	
	window.w2dc_my_location_buttons = function() {
		if (w2dc_maps_objects.enable_my_location_button) {
			$(".w2dc-get-location").attr("title", w2dc_maps_objects.my_location_button);
			$("body").on("click", ".w2dc-get-location", function() {
				if (!$(this).hasClass('w2dc-search-input-reset')) {
					var input = $(this).parent().find("input");
					w2dc_geocodeField(input, w2dc_maps_objects.my_location_button_error);
				} else {
					$(this).removeClass('w2dc-search-input-reset');
				}
			});
		}
	}
	
	window.w2dc_tokenizer = function() {
		function getUnique(value, index, self) { 
			return self.indexOf(value) === index;
		}
		
		var tokenizer = $(".w2dc-tokenizer").tokenize({
			onAddToken: function(value, text, e) {
				if (!w2dc_tags_metabox_attrs.unlimited_tags && tokenizer.toArray().filter(getUnique).length > w2dc_tags_metabox_attrs.tags_number) {
					tokenizer.tokenRemove(value);
					alert(w2dc_tags_metabox_attrs.tags_limit_message);
				}
			}
		});
	}

	window.w2dc_add_body_classes = function() {
		if ("ontouchstart" in document.documentElement)
			$("body").addClass("w2dc-touch");
		else
			$("body").addClass("w2dc-no-touch");
	}

	window.w2dc_listing_tabs = function() {
		var el = $('.w2dc-listing-tabs');
		var map = {};

		if (el.length) {
			$('.w2dc-listing-tabs li').each(function() { 
				var el = $(this);
				map[el.find('a').data('tab')] = el;
			});
	
			if (w2dc_js_objects.listing_tabs_order.length) {
				for (var i = 0, l = w2dc_js_objects.listing_tabs_order.length; i < l; i ++) {
					var tab = w2dc_js_objects.listing_tabs_order[i];
					
					if (map['#'+tab]) {
						el.append(map['#'+tab]);
					}
				}
				
				for (var i = 0, l = w2dc_js_objects.listing_tabs_order.length; i < l; i ++) {
					var tab = w2dc_js_objects.listing_tabs_order[i];
					
					if ($('#'+tab).length) {
						w2dc_show_tab($('.w2dc-listing-tabs a[data-tab="#'+tab+'"]'));
						break;
					}
				}
			} else {
				w2dc_show_tab($('.w2dc-listing-tabs a:first'));
			}
			
			$(document).on('click', '.w2dc-listing-tabs a', function(e) {	  
				e.preventDefault();
				w2dc_show_tab($(this));
				history.replaceState({}, "", $(this).data('tab'));
			});
			var hash = window.location.hash.substring(1);
			var searchParams = new URLSearchParams(window.location.search)
			if (hash == 'respond' || hash == 'comments' || searchParams.has('reviews_order_by') || hash.indexOf('comment-', 0) >= 0) {
				w2dc_show_tab($('.w2dc-listing-tabs a[data-tab="#comments-tab"]'));
			} else if (hash && $('.w2dc-listing-tabs a[data-tab="#'+hash+'"]').length) {
				w2dc_show_tab($('.w2dc-listing-tabs a[data-tab="#'+hash+'"]'));
			}
		}
	}
	window.w2dc_show_tab = function(tab) {
		$('.w2dc-listing-tabs li').removeClass('w2dc-active');
		tab.parent().addClass('w2dc-active');
		$('.w2dc-tab-content .w2dc-tab-pane').removeClass('w2dc-in w2dc-active');
		$('.w2dc-tab-content '+tab.data('tab')).addClass('w2dc-in w2dc-active');
		if (tab.data('tab') == '#addresses-tab') {
			w2dc_reload_maps();
		}
		tab.trigger("w2dc:show_tab");
	};
	window.w2dc_reload_maps = function() {
		for (var key in w2dc_maps) {
			if (typeof w2dc_maps[key] == 'object') {
				w2dc_reloadMap(key);
			}
		}
	};
	
	window.w2dc_radius_slider = function () {
		$('.w2dc-radius-slider').each(function() {
			var id = $(this).data("id");
			$('#radius_slider_'+id).slider({
				isRTL: w2dc_js_objects.is_rtl,
				min: parseInt(slider_params.min),
				max: parseInt(slider_params.max),
				range: "min",
				value: $("#radius_"+id).val(),
				slide: function(event, ui) {
					$("#radius_label_"+id).html(ui.value);
				},
				stop: function(event, ui) {
					$("#radius_"+id).val(ui.value);
					if (
						$("#radius_"+id).val() > 0 &&
						$(this).parents("form").find("input[name='address']").length &&
						$(this).parents("form").find("input[name='address']").val()
					) {
						$("#radius_"+id).trigger("change");
					}
				}
			});
		});
	}

	window.w2dc_hint = function () {
		$("a.w2dc-hint-icon").each(function() {
			$(this).w2dc_popover({
				trigger: "hover",
				//trigger: "manual",
				container: $(this).parents(".w2dc-content")
			});
		});
	}
	
	window.w2dc_favourites = function () {
		// Place listings to/from favourites list
		if ($(".add_to_favourites").length) {
			$('body').on('click', ".add_to_favourites", function() {
				var listing_id = $(this).attr("listingid");

				if ($.cookie("favourites") != null) {
					var favourites_array = $.cookie("favourites").split('*');
				} else {
					var favourites_array = new Array();
				}
				if (w2dc_in_array(listing_id, favourites_array) === false) {
					favourites_array.push(listing_id);
					$(this).find('span.w2dc-glyphicon').removeClass(w2dc_js_objects.not_in_favourites_icon).addClass(w2dc_js_objects.in_favourites_icon);
					$(this).find('span.w2dc-bookmark-button').text(w2dc_js_objects.not_in_favourites_msg);
				} else {
					for (var count=0; count<favourites_array.length; count++) {
						if (favourites_array[count] == listing_id) {
							delete favourites_array[count];
						}
					}
					$(this).find('span.w2dc-glyphicon').removeClass(w2dc_js_objects.in_favourites_icon).addClass(w2dc_js_objects.not_in_favourites_icon);
					$(this).find('span.w2dc-bookmark-button').text(w2dc_js_objects.in_favourites_msg);
				}
				$.cookie("favourites", favourites_array.join('*'), {expires: 365, path: "/"});
				return false;
			});
		}
	}
	
	window.w2dc_week_day_input = function () {
		// Set the same hours for all further selectboxes
		$('.w2dc-week-day-input-from-hour, .w2dc-week-day-input-to-hour, .w2dc-week-day-input-from-am-pm, .w2dc-week-day-input-to-am-pm').on('change', function() {
			var select_class = $(this).attr('class').replace('w2dc-week-day-input ', '');
			var index = $(this).index('.'+select_class);
			var val = $(this).val();
			
			$('.'+select_class).each(function() {
				if ($(this).index('.'+select_class) > index && !$(this).attr('disabled')) {
					$(this).val(val);
				}
			});
		});
	}
	
	window.w2dc_check_is_week_day_closed = function () {
		$('.closed_cb').each(function() {
			_w2dc_check_is_week_day_closed($(this));
		});
		$('body').on('click', '.closed_cb', function() {
			_w2dc_check_is_week_day_closed($(this));
		});
	}

	window._w2dc_check_is_week_day_closed = function (cb) {
		if (cb.is(":checked"))
			cb.parent().find(".w2dc-week-day-input").attr('disabled', 'disabled');
    	else
    		cb.parent().find(".w2dc-week-day-input").removeAttr('disabled');
	}
	
	if (!(/^((?!chrome|android).)*safari/i.test(navigator.userAgent))) {
		// refresh page on page back button (except safari)
		$(window).on('popstate', function() {
			//location.reload(true);
		});
	}
	
	window.w2dc_dashboard_tabs = function() {
		$('body').on('click', ".w2dc-dashboard-tabs.nav-tabs li", function(e) {
			window.location = $(this).find("a").attr("href");
		});
	}
	
	window.w2dc_sticky_scroll = function() {
		$('.w2dc-sticky-scroll').each(function() {
			var element = $(this);
			var id = element.data("id");
			var toppadding = (element.data("toppadding")) ? element.data("toppadding") : 0;
			var height = (element.data("height")) ? element.data("height") : null;
			
			if (toppadding == 0 && $("body").hasClass("admin-bar")) {
				toppadding = 32;
			}
			
			if ($('.site-header.header-fixed.fixed:visible').length) {
				var headerHeight = $('.site-header.header-fixed.fixed').outerHeight();
				toppadding = toppadding + headerHeight;
			}

			if (!$("#w2dc-scroller-anchor-"+id).length) {
				var anchor = $("<div>", {
					id: 'w2dc-scroller-anchor-'+id
				});
				element.before(anchor);
	
				var background = $("<div>", {
					id: 'w2dc-sticky-scroll-background-'+id,
					style: {position: 'relative'}
				});
				element.after(background);
			}
				
			window["w2dc_sticky_scroll_toppadding_"+id] = toppadding;
	
			$("#w2dc-sticky-scroll-background-"+id).position().left = element.position().left;
			$("#w2dc-sticky-scroll-background-"+id).position().top = element.position().top;
			$("#w2dc-sticky-scroll-background-"+id).width(element.width());
			$("#w2dc-sticky-scroll-background-"+id).height(element.height());

			var w2dc_scroll_function = function(e) {
				var id = e.data.id;
				var toppadding = e.data.toppadding;
				var b = $(document).scrollTop();
				var d = $("#w2dc-scroller-anchor-"+id).offset().top - toppadding;
				var c = e.data.obj;
				var e = $("#w2dc-sticky-scroll-background-"+id);
				
				c.width(c.parent().width()).css({ 'z-index': 100 });
		
				// .w2dc-scroller-bottom - this is special class used to restrict the area of scroll of map canvas
				if ($(".w2dc-scroller-bottom").length) {
					var f = $(".w2dc-scroller-bottom").offset().top - (c.height() + toppadding);
				} else {
					var f = $(document).height();
				}
		
				if (f > c.height()) {
					if (b >= d && b < f) {
						c.css({ position: "fixed", top: toppadding });
						e.css({ position: "relative" });
					} else {
						if (b <= d) {
							c.stop().css({ position: "relative", top: "" });
							e.css({ position: "absolute" });
						}
						if (b >= f) {
							c.css({ position: "absolute" });
							c.stop().offset({ top: f + toppadding });
							e.css({ position: "relative" });
						}
					}
				} else {
					c.css({ position: "relative", top: "" });
					e.css({ position: "absolute" });
				}
			};
			if ($(document).width() >= 768) {
				var args = {id: id, obj: $(this), toppadding: toppadding};
				$(window).scroll(args, w2dc_scroll_function);
				w2dc_scroll_function({data: args});
			}

			$("#w2dc-sticky-scroll-background-"+id).css({ position: "absolute" });

			/*if (height == '100%') {
				element.height(function(index, height) {
					return window.innerHeight - $("#scroller_anchor_"+id).outerHeight(true) - toppadding;
				});
				$(window).resize(function(){
					element.height(function(index, height) {
						return window.innerHeight - $("#scroller_anchor_"+id).outerHeight(true) - toppadding;
					});
				});
			}*/
		});
	}
	
	window.w2dc_full_height_maps = function() {
		$('.w2dc-maps-canvas-wrapper').each(function() {
			var element = $(this);
			var height = (element.data("height")) ? element.data("height") : null;
			
			if (height == '100%') {
				var toppadding = (element.data("toppadding")) ? element.data("toppadding") : 0;
				
				if (toppadding == 0 && $("body").hasClass("admin-bar")) {
					toppadding = 32;
				}
				
				if ($('.site-header.header-fixed.fixed:visible').length) {
					var headerHeight = $('.site-header.header-fixed.fixed').outerHeight();
					toppadding = toppadding + headerHeight;
				}

				element.height(function(index, height) {
					return window.innerHeight - toppadding;
				});
				$(window).resize(function(){
					element.height(function(index, height) {
						return window.innerHeight - toppadding;
					});
				});
			}
		});
	}
	
	window.w2dc_tooltips = function() {
		$('[data-toggle="w2dc-tooltip"]').w2dc_tooltip({
			 trigger : 'hover'
		});
	}
	
	window.w2dc_ratings = function() {
		$('body').on('click', '.w2dc-rating-active .w2dc-rating-icon', function() {
			var rating = $(this).parent(".w2dc-rating-stars");
			var rating_wrapper = $(this).parents(".w2dc-rating");
			
			if (!rating.hasClass('w2dc-rating-active-noajax')) {
				rating_wrapper.fadeTo(2000, 0.3);
				
				$.ajax({
		        	url: w2dc_js_objects.ajaxurl,
		        	type: "POST",
		        	dataType: "json",
		            data: {
		            	action: 'w2dc_save_rating',
		            	rating: $(this).data("rating"),
		            	post_id: rating.data("listing"),
		            	_wpnonce: rating.data("nonce")
		            },
		            rating_wrapper: rating_wrapper,
		            success: function(response_from_the_action_function){
		            	if (response_from_the_action_function != 0 && response_from_the_action_function.html) {
		            		this.rating_wrapper
		            		.replaceWith(response_from_the_action_function.html)
		            		.fadeIn("fast");
		            	}
		            }
		        });
			} else {
				var rating_value = $(this).data("rating");
				rating.find('.w2dc-rating-noajax-value').val(rating_value);
				rating.find('.w2dc-rating-icon').each(function() {
					$(this).removeClass('w2dc-fa-star w2dc-fa-star-o')
					if ($(this).data("rating") <= rating_value) {
						$(this).addClass('w2dc-fa-star');
					} else {
						$(this).addClass('w2dc-fa-star-o');
					}
				});
			}
		});
	}

	window.w2dc_hours_content_field = function() {
		function close_option(option) {
			if (option.is(":checked")) {
				option.parents(".w2dc-week-day-wrap").find("select").attr("disabled", "disabled");
			} else {
				option.parents(".w2dc-week-day-wrap").find("select").removeAttr("disabled");
			}
		}
		$(".w2dc-closed-day-option").each(function() {
			close_option($(this));
		});
		$("body").on("change", ".w2dc-closed-day-option", function() {
			close_option($(this));
		});
		
		$("body").on("click", ".w2dc-clear-hours", function() {
			$(this).parents(".w2dc-field-input-block").find("select").each( function() { $(this).val($(this).find("option:first").val()).removeAttr('disabled'); });
			$(this).parents(".w2dc-field-input-block").find('input[type="checkbox"]').each( function() { $(this).prop("checked", false); });
			return false;
		});
	}

	window.w2dc_custom_input_controls = function() {
		// Custom input controls
		$(".w2dc-checkbox label, .w2dc-radio label").each(function() {
			if (!$(this).find(".w2dc-control-indicator").length) {
				$(this).append($("<div>").addClass("w2dc-control-indicator"));
			}
		});
		
		var slider_input_controls = function(el) {
			var sheet = document.createElement('style');
			document.body.appendChild(sheet);
			
			var prefs = ['webkit-slider-runnable-track', 'moz-range-track', 'ms-track'];
			
			var id = $(el).attr('id');
			var slider_color = $('#'+id).css("background-color");
			var curVal = parseInt(el.value);
			var rating = (curVal + 1) / 2;
			var gradientVal = (curVal - 1) * 12.5;
			var style = '';

			$('.w2dc-range-slider-labels.'+id+' li').removeClass('w2dc-range-slider-labels-active w2dc-range-slider-labels-selected');
			var curLabel = $('.w2dc-range-slider-labels.'+id).find('li:nth-child(' + curVal + ')');
			curLabel.addClass('w2dc-range-slider-labels-active w2dc-range-slider-labels-selected');
			curLabel.prevAll().addClass('w2dc-range-slider-labels-selected');

			$('.w2dc-range-slider-value.'+id).html(rating);
			
			var gradient_destination = 'to right';
			if (w2dc_js_objects.is_rtl) {
				gradient_destination = 'to left';
			}

			for (var i = 0; i < prefs.length; i++) {
				style += '#'+id+'::-' + prefs[i] + '{background: linear-gradient(' + gradient_destination + ', ' + slider_color + ' 0%, ' + slider_color + ' ' + gradientVal + '%, #f0f0f0 ' + gradientVal + '%, #f0f0f0 100%)}';
			}
			sheet.textContent = style;
			
			var sum = 0;
			$('.w2dc-range-slider-value').each(function() {
				sum += Number($(this).text());
			});
			var avg = Math.round(sum/$('.w2dc-range-slider-value').length*10)/10;
			var avg_percents = Math.round(((sum/$('.w2dc-range-slider-value').length)-1)*25);
			$('.w2dc-progress-circle span').text(avg.toFixed(1));
			$('.w2dc-progress-circle').removeClass().addClass('w2dc-progress-circle').addClass('p'+avg_percents);
			if (avg_percents > 50) {
				$('.w2dc-progress-circle').addClass('w2dc-over50');
			}
		}
		$(".w2dc-range-slider-input").each(function () {
			slider_input_controls(this);
		});
		$(".w2dc-range-slider-input").on('input', function () {
			slider_input_controls(this);
		});
		$('.w2dc-range-slider-labels li').on('click', function () {
			var index = $(this).index();
			var input = $(this).parents('.w2dc-range-slider').find('.w2dc-range-slider-input');
			input.val(index + 1).trigger('input');
		});
	}
	$(document).ajaxComplete(function(event, xhr, settings) {
		if (settings.url === w2dc_js_objects.ajaxurl) {
			w2dc_custom_input_controls();
		}
	});

	window.w2dc_get_rid_of_select2_choosen = function() {
		$("select.w2dc-form-control, select.vp-input, select.w2dc-week-day-input, select.w2dc-tokenizer").each(function (i, obj) {
			// get rid of select2
			if ($(obj).hasClass('select2-hidden-accessible') || $('#s2id_' + $(obj).attr('id')).length) {
				$(obj).select2('destroy');
			}
			// get rid of chosen
			if ($('#' + $(obj).attr('id') + '_chosen').length) {
				$(obj).chosen('destroy');
			}
		});
	}
		
	window.w2dc_process_main_search_fields = function() {
		if (typeof categories_combobox != "undefined") {
			$(".w2dc-selectmenu-w2dc-category").categories_combobox();
			$(".w2dc-selectmenu-w2dc-location").locations_combobox();
			$(".w2dc-address-autocomplete").address_autocomplete();
			$(".w2dc-keywords-autocomplete").keywords_autocomplete();
		}
	}
	
	window.w2dc_advancedSearch = function(uID, more_filters, less_filters) {
		if ($("#use_advanced_" + uID).val() == 1) {
			$("#w2dc-advanced-search-label_" + uID).find(".w2dc-advanced-search-text").text(less_filters);

			$("#w2dc-advanced-search-label_" + uID).find(".w2dc-advanced-search-toggle")
			.removeClass("w2dc-glyphicon-chevron-down")
			.addClass("w2dc-glyphicon-chevron-up");
		}
		$("#w2dc-advanced-search-label_" + uID).off("click");
		$('body').on('click', "#w2dc-advanced-search-label_" + uID, function(e) {
			if ($("#w2dc_advanced_search_fields_" + uID).is(":hidden")) {
				$(this).find(".w2dc-advanced-search-text").text(less_filters);
				$("#use_advanced_" + uID).val(1);
				$("#w2dc_advanced_search_fields_" + uID).slideDown(200);

				$(this).find(".w2dc-advanced-search-toggle")
				.removeClass("w2dc-glyphicon-chevron-down")
				.addClass("w2dc-glyphicon-chevron-up");
			} else {
				$(this).find(".w2dc-advanced-search-text").text(more_filters);
				$("#use_advanced_" + uID).val(0);
				$("#w2dc_advanced_search_fields_" + uID).slideUp(200);

				$(this).find(".w2dc-advanced-search-toggle")
				.removeClass("w2dc-glyphicon-chevron-up")
				.addClass("w2dc-glyphicon-chevron-down");
			}
		});
	};

	window.w2dc_equalColumnsHeightEvent = function() {
		$(window).on('orientationchange resize', w2dc_equalColumnsHeight);
	}
		
	window.w2dc_equalColumnsHeight = function() {
		setTimeout(function(){
			$(".w2dc-listings-grid .w2dc-listing, .w2dc-mobile-listings-grid-2 .w2dc-listing").css('height', '');

			var currentTallest = 0;
			var currentRowStart = 0;
			var rowDivs = new Array();
			var $el;
			var topPosition = 0;
			$(".w2dc-listings-grid .w2dc-listing, .w2dc-mobile-listings-grid-2 .w2dc-listing").each(function() {
				$el = $(this);
				if ($(document).width() >= 768 && !$el.hasClass("w2dc-mobile-listings-grid-1")) {
					var topPostion = $el.position().top;
					if (currentRowStart != topPostion) {
						for (var currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
							rowDivs[currentDiv].height(currentTallest);
						}
						rowDivs.length = 0;
						currentRowStart = topPostion;
						currentTallest = $el.height();
						rowDivs.push($el);
					} else {
						rowDivs.push($el);
						currentTallest = (currentTallest < $el.height()) ? ($el.height()) : (currentTallest);
					}
					for (var currentDiv = 0 ; currentDiv < rowDivs.length ; currentDiv++) {
						rowDivs[currentDiv].height(currentTallest);
					}
				}
			});
		}, 500);
	}
	
	window.w2dc_sendGeoPolyAJAX = function(map_id, geo_poly_ajax) {
		var map_attrs_array;
		if (map_attrs_array = w2dc_get_map_markers_attrs_array(map_id)) {
			w2dc_ajax_loader_target_show($('#w2dc-maps-canvas-'+map_id));
			
			var ajax_params = {};
			for (var attrname in map_attrs_array.map_attrs) { ajax_params[attrname] = map_attrs_array.map_attrs[attrname]; }
			ajax_params.action = 'w2dc_search_by_poly';
			ajax_params.hash = map_id;
			ajax_params.geo_poly = geo_poly_ajax;
			ajax_params.num = -1; // do not limit markers on map

			var listings_args_array;
			if (listings_args_array = w2dc_get_controller_args_array(map_id)) {
				ajax_params.hide_order = listings_args_array.hide_order;
				ajax_params.hide_count = listings_args_array.hide_count;
				ajax_params.hide_content = listings_args_array.hide_content;
				ajax_params.hide_paginator = listings_args_array.hide_paginator;
				ajax_params.show_views_switcher = listings_args_array.show_views_switcher;
				ajax_params.listings_view_type = listings_args_array.listings_view_type;
				ajax_params.listings_view_grid_columns = listings_args_array.listings_view_grid_columns;
				ajax_params.listing_thumb_width = listings_args_array.listing_thumb_width;
				ajax_params.wrap_logo_list_view = listings_args_array.wrap_logo_list_view;
				ajax_params.logo_animation_effect = listings_args_array.logo_animation_effect;
				ajax_params.grid_view_logo_ratio = listings_args_array.grid_view_logo_ratio;
				ajax_params.scrolling_paginator = listings_args_array.scrolling_paginator;
				ajax_params.paged = listings_args_array.paged;
				ajax_params.perpage = listings_args_array.perpage;
				ajax_params.onepage = listings_args_array.onepage;
				ajax_params.order = listings_args_array.order;
				ajax_params.order_by = listings_args_array.order_by;
				ajax_params.base_url = listings_args_array.base_url;

				w2dc_ajax_loader_target_show($('#w2dc-controller-'+map_id));
			} else {
				ajax_params.without_listings = 1;
			}
			
			if ($("#w2dc-map-listings-panel-"+map_id).length) {
				ajax_params.map_listings = 1;
				w2dc_ajax_loader_target_show($("#w2dc-map-search-panel-wrapper-"+map_id));
			}

			$.post(
				w2dc_js_objects.ajaxurl,
				ajax_params,
				function(response_from_the_action_function) {
					w2dc_process_listings_ajax_responce(response_from_the_action_function, true, false, false);
				},
				'json'
			);
		}
	}
	
	window.w2dc_isSidebarOpen = function(map_id) {
		return ($("#w2dc-maps-canvas-"+map_id).length && $("#w2dc-maps-canvas-"+map_id).hasClass("w2dc-sidebar-open"));
	}
	
	$.fn.swipeDetector = function (options) {
		// States: 0 - no swipe, 1 - swipe started, 2 - swipe released
		var swipeState = 0;
		// Coordinates when swipe started
		var startX = 0;
		var startY = 0;
		// Distance of swipe
		var pixelOffsetX = 0;
		var pixelOffsetY = 0;
		// Target element which should detect swipes.
		var swipeTarget = this;
		var defaultSettings = {
				// Amount of pixels, when swipe don't count.
				swipeThreshold: 70,
				// Flag that indicates that plugin should react only on touch events.
				// Not on mouse events too.
				useOnlyTouch: false
		};

		// Initializer
		(function init() {
			options = $.extend(defaultSettings, options);
			// Support touch and mouse as well.
			swipeTarget.on('mousedown touchstart', swipeStart);
			$('html').on('mouseup touchend', swipeEnd);
			$('html').on('mousemove touchmove', swiping);
		})();

		function swipeStart(event) {
			if (options.useOnlyTouch && !event.originalEvent.touches)
				return;

			if (event.originalEvent.touches)
				event = event.originalEvent.touches[0];

			if (swipeState === 0) {
				swipeState = 1;
				startX = event.clientX;
				startY = event.clientY;
			}
		}

		function swipeEnd(event) {
			if (swipeState === 2) {
				swipeState = 0;

				if (Math.abs(pixelOffsetX) > Math.abs(pixelOffsetY) &&
						Math.abs(pixelOffsetX) > options.swipeThreshold) { // Horizontal Swipe
					if (pixelOffsetX < 0) {
						swipeTarget.trigger($.Event('swipeLeft.sd'));
					} else {
						swipeTarget.trigger($.Event('swipeRight.sd'));
					}
				} else if (Math.abs(pixelOffsetY) > options.swipeThreshold) { // Vertical swipe
					if (pixelOffsetY < 0) {
						swipeTarget.trigger($.Event('swipeUp.sd'));
					} else {
						swipeTarget.trigger($.Event('swipeDown.sd'));
					}
				}
			}
		}

		function swiping(event) {
			// If swipe don't occuring, do nothing.
			if (swipeState !== 1) 
				return;

			if (event.originalEvent.touches) {
				event = event.originalEvent.touches[0];
			}

			var swipeOffsetX = event.clientX - startX;
			var swipeOffsetY = event.clientY - startY;

			if ((Math.abs(swipeOffsetX) > options.swipeThreshold) ||
					(Math.abs(swipeOffsetY) > options.swipeThreshold)) {
				swipeState = 2;
				pixelOffsetX = swipeOffsetX;
				pixelOffsetY = swipeOffsetY;
			}
		}

		return swipeTarget; // Return element available for chaining.
	}

	var w2dc_animation_finished = true;
	window.w2dc_listings_carousel = function() {

		$(".w2dc-listings-carousel-wrapper").each(function() {
			var id = $(this).data("controller-hash");
			var currentTallest = 0;
			$(this).find("article.w2dc-listing").each(function() {
				currentTallest = (currentTallest < $(this).height()) ? ($(this).height()) : (currentTallest);
			});
			$(this).height(currentTallest);
				
			var content = $("#w2dc-controller-"+id+" .w2dc-listings-block-content");
			var slide_width = content.find("article.w2dc-listing").outerWidth(true);
			$("body").on("click", "#w2dc-controller-"+id+" .w2dc-listings-carousel-button-left", function() {
				w2dc_prev_slide(content, slide_width);
			});
			$("body").on("click", "#w2dc-controller-"+id+" .w2dc-listings-carousel-button-right", function() {
				w2dc_next_slide(content, slide_width);
			});
			$("body").on("mousewheel", "#w2dc-controller-"+id+" .w2dc-listings-carousel", function(event, delta, deltaX, deltaY) {
				if (delta > 0) {
					w2dc_prev_slide(content, slide_width);
				}
				if (deltaY < 0) {
					w2dc_next_slide(content, slide_width);
				}
				event.stopPropagation();
				event.preventDefault();
			});
				
			$("#w2dc-controller-"+id+" .w2dc-listings-carousel")
			.swipeDetector({ swipeThreshold: 30 })
			.on("swipeRight.sd", function() {
				w2dc_prev_slide(content, slide_width);
			})
			.on("swipeLeft.sd", function() {
				w2dc_next_slide(content, slide_width);
			});
		});
	}
	window.w2dc_prev_slide = function(content, slide_width) {
		if (w2dc_animation_finished) {
			var listing = content.find("article.w2dc-listing:last");
			content
			.css({ "margin-left": -slide_width })
			.prepend(listing.clone());
			
			w2dc_animation_finished = false;
			content.animate({
				"margin-left": 0
			}, 300, function () { 
				listing.remove();
				w2dc_animation_finished = true;
			});
		}
	}
	window.w2dc_next_slide = function(content, slide_width) {
		if (w2dc_animation_finished) {
			var listing = content.find("article.w2dc-listing:first");
			content.append(listing.clone());
			
			w2dc_animation_finished = false;
			content.animate({
				"margin-left": -slide_width
			}, 300, function () { 
				listing.remove();
				content.css({ "margin-left": 0 })
				w2dc_animation_finished = true;
			});
		}
	}
	
	// AJAX Comments scripts
	window.w2dc_comments_ajax_load_template = function(params, my_global) {
        var my_global;
        var request_in_process = false;

        params.action = "w2dc_comments_load_template";

        $.ajax({
        	url: w2dc_js_objects.ajaxurl,
        	type: "POST",
        	dataType: "html",
            data: params,
            global: my_global,
            success: function( msg ){
                $(params.target_div).fadeIn().html(msg);
                request_in_process = false;
                w2dc_nice_scroll();
                if (typeof params.callback === "function") {
                    params.callback();
                }
            }
        });
    }
    $(document).on('submit', '#w2dc_default_add_comment_form', function(e) {
       e.preventDefault();

       var $this = $(this);
       $this.css('opacity', '0.5');

       var data = {
           action: "w2dc_comments_add_comment",
           post_id: $('#w2dc_comments_ajax_handle').data('post_id'),
           user_name: $('#w2dc_comments_user_name').val(),
           user_email: $('#w2dc_comments_user_email').val(),
           user_url: $('#w2dc_comments_user_url').val(),
           comment: $('#comment').val(),
           comment_parent: $('#comment_parent').val(),
           security: $('#w2dc_comments_nonce').val()
       };

       $.ajax({
        	url: w2dc_js_objects.ajaxurl,
        	type: "POST",
        	dataType: "html",
            data: data,
            global: false,
            success: function( msg ){
                w2dc_comments_ajax_load_template({
                    "target_div": "#w2dc_comments_ajax_target",
                    "template": $('#w2dc_comments_ajax_handle').attr('data-template'),
                    "post_id": $('#w2dc_comments_ajax_handle').attr('data-post_id'),
                    "security": $('#w2dc_comments_nonce').val()
                }, false );
                $('textarea').val('');
                $this.css('opacity', '1');
            }
        });
    });
    $(document).on('keypress', '#w2dc_default_add_comment_form textarea, #w2dc_default_add_comment_form input', function(e) {
        if (e.keyCode == '13') {
            e.preventDefault();
            $('#w2dc_default_add_comment_form').submit();
        }
    });
    window.w2dc_load_comments = function() {
        if ($('#w2dc_comments_ajax_handle').length) {

            var data = {
                "action": "w2dc_comments_load_template",
                "target_div": "#w2dc_comments_ajax_target",
                "template": $('#w2dc_comments_ajax_handle').data('template'),
                "post_id": $('#w2dc_comments_ajax_handle').data('post_id'),
                "security": $('#w2dc_comments_nonce').val()
            };

            $.ajax({
            	url: w2dc_js_objects.ajaxurl,
            	type: "POST",
            	dataType: "html",
                data: data,
                success: function(msg){
                	w2dc_nice_scroll();
                    $("#w2dc_comments_ajax_target").fadeIn().html(msg); // Give a smooth fade in effect
                    if (window.location.hash && $(window.location.hash).length){
                        $('html, body').animate({
                            scrollTop: $(window.location.hash).offset().top
                        });
                        $(window.location.hash).addClass('w2dc-comments-highlight');
                    }
                }
            });

            $(document).on('click', '.w2dc-comments-time-handle', function(e) {
                $('.w2dc-comments-content').removeClass('w2dc-comments-highlight')
                comment_id = '#comment-' + $(this).attr('data-comment_id');
                $(comment_id).addClass('w2dc-comments-highlight');
            });
        }
    };
    $(document).on('click', '#w2dc_cancel_reply', function(e) {
    	$('#comment_parent').val(0);
    	$('#w2dc-comments-leave-comment-label').html(w2dc_js_objects.leave_comment);
    });
    $(document).on('click', '.w2dc-comment-reply', function(e) {
    	var comment_id = $(this).data("comment-id");
    	var comment_author = $(this).data("comment-author");
    	$('#comment_parent').val(comment_id);
    	$('#w2dc-comments-leave-comment-label').html(w2dc_js_objects.leave_reply+" "+comment_author+". <a id='w2dc_cancel_reply' href='javascript: void(0);'>"+w2dc_js_objects.cancel_reply+"</a>");
    });
    $(document).on('click', '.w2dc-comments-more-handle', function(e) {
        e.preventDefault();
        if ($(this).hasClass('w2dc-comments-more-open')) {
            $('a', this).html(w2dc_js_objects.more);
            $('#comment').css('height', '0');
        } else {
            $('a', this).html(w2dc_js_objects.less);
            $('#comment').css('height', '150');
        }
        $(this).toggleClass('w2dc-comments-more-open');
        $('.w2dc-comments-more-container').toggle();
        w2dc_nice_scroll();
    });
    
    window.w2dc_content_fields_metabox = function() {
    	hideShowFields_init();
    	
		$("input[name='tax_input\\[w2dc-category\\]\\[\\]']").change(function() { hideShowFields_onclick($(this)) });
		$("#w2dc-category-pop input[type=checkbox]").change(function() { hideShowFields_onclick($(this)) });

		function hideShowFields_init() {
			var selected_categories_ids = [];
			$.each($("input[name='tax_input\\[w2dc-category\\]\\[\\]']:checked"), function() {
				selected_categories_ids.push($(this).val());
			});

			$(".w2dc-content-fields-metabox").show();
			$(".w2dc-field-input-block").hide();
			$.each(w2dc_js_objects.fields_in_categories, function(index, value) {
				var show_field = false;
				if (value != undefined) {
					if (value.length > 0) {
						var key;
						for (key in value) {
							var key2;
							for (key2 in selected_categories_ids) {
								if (value[key] == selected_categories_ids[key2]) {
									show_field = true;
								}
							}
						}
					}

					if ((value.length == 0 || show_field) && $(".w2dc-field-input-block-"+index).length) {
						$(".w2dc-field-input-block-"+index).show();
					}
				}
			});
			$.each($(".w2dc-content-fields-metabox"), function() {
				if ($(this).find(".w2dc-field-input-block").filter(function() { return $(this).css("display") != "none"; }).length) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		}
		
		function hideShowFields_onclick(input) {
			var checked = input.prop('checked');
			var id = input.val();
			
			var fields_to_apply = [];
			$.each(w2dc_js_objects.fields_in_categories, function(index, value) {
				if (value != undefined) {
					if (value.length > 0) {
						var key;
						for (key in value) {
							if (value[key] == id) {
								fields_to_apply.push(index);
							}
						}
					}
				}
			});
			
			for (var key in fields_to_apply) {
				var index = fields_to_apply[key];
				if (checked) {
					$(".w2dc-field-input-block-"+index).parents(".w2dc-content-fields-metabox").slideDown(500);
					$(".w2dc-field-input-block-"+index).slideDown(500);
				} else {
					$(".w2dc-field-input-block-"+index).slideUp(300, function() {
						var metabox = $(this).parents(".w2dc-content-fields-metabox");
						if (!metabox.find(".w2dc-field-input-block:visible").length) {
							metabox.slideUp(500);
						}
					});
				}
			}
		}
    };
	
	window.w2dc_ajax_loader_target_show = function(target, scroll_to_anchor, offest_top) {
		if (typeof scroll_to_anchor != 'undefined' && scroll_to_anchor) {
			if (typeof offest_top == 'undefined' || !offest_top) {
				var offest_top = 0;
			}
			$('html,body').animate({scrollTop: scroll_to_anchor.offset().top - offest_top}, 'slow');
		}
		var id = target.attr("id");
		if (!$("[data-loader-id='"+id+"']").length) {
			var loader = $('<div data-loader-id="'+id+'" class="w2dc-ajax-target-loading"><div class="w2dc-loader"></div></div>');
			target.prepend(loader);
			loader.css({
				width: target.outerWidth()+10,
				height: target.outerHeight()+10
			});
			if (target.outerHeight() > 600) {
				loader.find(".w2dc-loader").addClass("w2dc-loader-max-top");
			}
		}
	}
	window.w2dc_ajax_loader_target_hide = function(id) {
		$("[data-loader-id='"+id+"']").remove();
	}
	
	window.w2dc_ajax_loader_show = function(msg) {
		var overlay = $('<div id="w2dc-ajax-loader-overlay"><div class="w2dc-loader"></div></div>');
	    $('body').append(overlay);
	}
	
	window.w2dc_ajax_loader_hide = function() {
		$("#w2dc-ajax-loader-overlay").remove();
	}

	window.w2dc_get_controller_args_array = function(hash) {
		if (typeof w2dc_controller_args_array != 'undefined' && Object.keys(w2dc_controller_args_array))
			for (var controller_hash in w2dc_controller_args_array)
				if (controller_hash == hash)
					return w2dc_controller_args_array[controller_hash];
	}

	window.w2dc_get_map_markers_attrs_array = function(hash) {
		if (typeof w2dc_map_markers_attrs_array != 'undefined' && Object.keys(w2dc_map_markers_attrs_array))
			for (var i=0; i<w2dc_map_markers_attrs_array.length; i++)
				if (hash == w2dc_map_markers_attrs_array[i].map_id)
					return w2dc_map_markers_attrs_array[i];
	}

	window.w2dc_get_original_map_markers_attrs_array = function(hash) {
		if (typeof _w2dc_map_markers_attrs_array != 'undefined' && Object.keys(_w2dc_map_markers_attrs_array))
			for (var i=0; i<_w2dc_map_markers_attrs_array.length; i++)
				if (hash == _w2dc_map_markers_attrs_array[i].map_id)
					return _w2dc_map_markers_attrs_array[i];
	}
	
	window.w2dc_process_listings_ajax_responce = function(response_from_the_action_function, do_replace, remove_shapes, do_replace_markers) {
		var responce_hash = response_from_the_action_function.hash;
		if (response_from_the_action_function) {
			var listings_block = $('#w2dc-controller-'+responce_hash);
			if (do_replace) {
				listings_block.replaceWith(response_from_the_action_function.html);
			} else {
				listings_block.find(".w2dc-listings-block-content").append(response_from_the_action_function.html);
			}
			w2dc_ajax_loader_target_hide("w2dc-controller-"+responce_hash);
			if (response_from_the_action_function.map_markers && typeof w2dc_maps[responce_hash] != 'undefined') {
				if (do_replace) {
					w2dc_clearMarkers(responce_hash);
				}
				if (remove_shapes) {
					w2dc_removeShapes(responce_hash);
				}
				w2dc_closeInfoWindow(responce_hash);
				
				var markers_array = response_from_the_action_function.map_markers;
				
				var enable_radius_circle = 0;
				var enable_clusters = 0;
				var show_summary_button = 1;
				var show_readmore_button = 1;
				var attrs_array;
				if (attrs_array = w2dc_get_map_markers_attrs_array(responce_hash)) {
					var enable_radius_circle = attrs_array.enable_radius_circle;
					var enable_clusters = attrs_array.enable_clusters;
					var show_summary_button = attrs_array.show_summary_button;
					var show_readmore_button = attrs_array.show_readmore_button;
					var map_attrs = attrs_array.map_attrs;

					if (do_replace_markers) {
						attrs_array.markers_array = eval(response_from_the_action_function.map_markers);
					}
				}

		    	for (var j=0; j<markers_array.length; j++) {
	    			var map_coords_1 = markers_array[j][1];
			    	var map_coords_2 = markers_array[j][2];
			    	if ($.isNumeric(map_coords_1) && $.isNumeric(map_coords_2)) {
		    			var point = w2dc_buildPoint(map_coords_1, map_coords_2);

		    			var location_obj = new w2dc_glocation(markers_array[j][0], point, 
		    				markers_array[j][3],
		    				markers_array[j][4],
		    				markers_array[j][6],
		    				markers_array[j][7],
		    				markers_array[j][8],
		    				markers_array[j][9],
		    				markers_array[j][10],
		    				markers_array[j][11],
		    				show_summary_button,
		    				show_readmore_button,
		    				responce_hash,
		    				false
			    		);
			    		var marker = location_obj.w2dc_placeMarker(responce_hash);
			    		w2dc_global_locations_array[responce_hash].push(location_obj);
			    	}
	    		}
		    	if (w2dc_global_markers_array[responce_hash].length) {
		    		var bounds = w2dc_buildBounds();
		    		for (var j=0; j<w2dc_global_markers_array[responce_hash].length; j++) {
		    			var marker = w2dc_global_markers_array[responce_hash][j];
		    			var marker_position = w2dc_getMarkerPosition(marker);
		    			w2dc_extendBounds(bounds, marker_position);
		    		}
		    		w2dc_mapFitBounds(responce_hash, bounds);

		    		if (w2dc_global_markers_array[responce_hash].length == 1) {
		    			w2dc_setMapZoom(responce_hash, ZOOM_FOR_SINGLE_MARKER);
		    		}
		    	}

		    	w2dc_ajax_loader_target_hide('w2dc-maps-canvas-'+responce_hash);

	    		w2dc_setClusters(enable_clusters, responce_hash, w2dc_global_markers_array[responce_hash]);

		    	if (remove_shapes) {
			    	if (enable_radius_circle && typeof response_from_the_action_function.radius_params != 'undefined') {
			    		var radius_params = response_from_the_action_function.radius_params;
						var map_radius = parseFloat(radius_params.radius_value);
						w2dc_draw_radius(radius_params, map_radius, responce_hash);
					}
		    	}
			}
			if (typeof response_from_the_action_function.map_listings != 'undefined' && typeof w2dc_maps[responce_hash] != 'undefined') {
				var map_listings_block = $('#w2dc-map-listings-panel-'+responce_hash);
		    	if (map_listings_block.length) {
		    		if (do_replace) {
		    			map_listings_block.html(response_from_the_action_function.map_listings);
		    		} else {
		    			map_listings_block.append(response_from_the_action_function.map_listings);
		    		}
		    	}
		    	w2dc_ajax_loader_target_hide('w2dc-map-search-panel-wrapper-'+responce_hash);
			}
		}
		w2dc_ajax_loader_target_hide('w2dc-controller-'+responce_hash);
		w2dc_ajax_loader_target_hide('w2dc-maps-canvas-'+responce_hash);
		w2dc_equalColumnsHeight();
		if (w2dc_js_objects.is_maps_used) {
			w2dc_show_on_map_links();
		}
		w2dc_sticky_scroll();
	}

	window.w2dc_load_ajax_initial_elements = function() {
		// We have to wait while Google Maps API will be completely loaded
		if (typeof w2dc_controller_args_array != 'undefined' && Object.keys(w2dc_controller_args_array)) {
			for (var controller_hash in w2dc_controller_args_array) {
				var post_params = w2dc_controller_args_array[controller_hash];
				if (w2dc_js_objects.ajax_initial_load || (typeof post_params.ajax_initial_load != 'undefined' && post_params.ajax_initial_load == 1)) {
					var ajax_params = {'action': 'w2dc_controller_request', 'hash': controller_hash};
					for (var attrname in ajax_params) { post_params[attrname] = ajax_params[attrname]; }
	
					if ((typeof post_params['with_map'] != 'undefined' && post_params['with_map']) || $("#w2dc-maps-canvas-"+controller_hash).length) {
						var map_attrs_array;
						if (map_attrs_array = w2dc_get_map_markers_attrs_array(controller_hash))
							if (typeof map_attrs_array.map_attrs.ajax_loading != "undefined" && map_attrs_array.map_attrs.ajax_loading == 1)
								continue;
							
						post_params['with_map'] = 1;
						w2dc_ajax_loader_target_show($('#w2dc-maps-canvas-'+controller_hash));
					}
	
				   	w2dc_ajax_loader_target_show($('#w2dc-controller-'+controller_hash));
					$.post(
						w2dc_js_objects.ajaxurl,
						post_params,
						function(response_from_the_action_function) {
							w2dc_process_listings_ajax_responce(response_from_the_action_function, true, true, true);
							var responce_hash = response_from_the_action_function.hash;
							if (response_from_the_action_function.map_markers && typeof w2dc_maps[responce_hash] != 'undefined')
								if (typeof _w2dc_map_markers_attrs_array != 'undefined' && _w2dc_map_markers_attrs_array.length) {
									for (var i=0; i<_w2dc_map_markers_attrs_array.length; i++)
										if (responce_hash == _w2dc_map_markers_attrs_array[i].map_id)
											_w2dc_map_markers_attrs_array[i].markers_array = eval(response_from_the_action_function.map_markers);
								}
						},
						'json'
					);
				}
			}
		}
	}
	
	window.w2dc_ajax_iloader = $("<div>", { class: 'w2dc-ajax-iloader' }).html('<div class="rect1"></div><div class="rect2"></div><div class="rect3"></div><div class="rect4"></div><div class="rect5"></div>');
	window.w2dc_add_iloader_on_element = function(button) {
		button
		.attr('disabled', 'disabled')
		.wrapInner('<div class="w2dc-hidden"></div>')
		.append(w2dc_ajax_iloader);
	}
	window.w2dc_delete_iloader_from_element = function(button) {
		button.find(".w2dc-hidden").contents().unwrap();
		button.removeAttr('disabled').find(".w2dc-ajax-iloader").remove();
	}
	
	var w2dc_show_more_button_processing = false;
	$(window).scroll(function() {
		$('.w2dc-show-more-button.w2dc-scrolling-paginator').each(function() {
			if ($(window).scrollTop() + $(window).height() > $(this).position().top) {
				if (!w2dc_show_more_button_processing) {
					w2dc_callShowMoreListings($(this));
				}
			}
		});
	});
	$('body').on('click', '.w2dc-show-more-button', function(e) {
		e.preventDefault();
		w2dc_callShowMoreListings($(this));
	});
	var w2dc_callShowMoreListings = function(button) {
		var controller_hash = button.data("controller-hash");
		var listings_args_array;
		if (listings_args_array = w2dc_get_controller_args_array(controller_hash)) {
			w2dc_add_iloader_on_element(button);

			var post_params = $.extend({}, listings_args_array);
			if (typeof post_params.paged != 'undefined')
				var paged = parseInt(post_params.paged)+1;
			else
				var paged = 2;
			listings_args_array.paged = paged;
			
			var existing_listings = '';
			$("#w2dc-controller-"+controller_hash+" .w2dc-listings-block-content article").each(function(index) {
				existing_listings = $(this).attr("id").replace("post-", "") + "," + existing_listings;
			});

			var ajax_params = {'action': 'w2dc_controller_request', 'do_append': 1, 'paged': paged, 'existing_listings': existing_listings, 'hash': controller_hash};
			for (var attrname in ajax_params) { post_params[attrname] = ajax_params[attrname]; }

			if ($("#w2dc-maps-canvas-"+controller_hash).length) {
				var map_attrs_array;
				if (map_attrs_array = w2dc_get_map_markers_attrs_array(controller_hash)) {
					if ((typeof map_attrs_array.map_attrs.ajax_loading == 'undefined' || map_attrs_array.map_attrs.ajax_loading == 0)
					&&
					(typeof map_attrs_array.map_attrs.drawing_state == 'undefined' || map_attrs_array.map_attrs.drawing_state == 0)
					&&
					(typeof map_attrs_array.map_attrs.map_markers_is_limit == 'undefined' || map_attrs_array.map_attrs.map_markers_is_limit == 1)) {
						w2dc_ajax_loader_target_show($('#w2dc-maps-canvas-'+controller_hash));
					  	post_params.with_map = 1;
					  	post_params.map_markers_is_limit = 1;
					  	if ($("#w2dc-map-listings-panel-"+controller_hash).length) {
							post_params.map_listings = 1;
							w2dc_ajax_loader_target_show($("#w2dc-map-search-panel-wrapper-"+controller_hash));
						}
					} else {
						post_params.with_map = 0;
						post_params.map_listings = 0;
					}
				}
			}

			w2dc_show_more_button_processing = true;
			$.post(
				w2dc_js_objects.ajaxurl,
				post_params,
				w2dc_completeAJAXShowMore(button),
				'json'
			);
		}
	}
	var w2dc_completeAJAXShowMore = function(button) {
		return function(response_from_the_action_function) {
			w2dc_process_listings_ajax_responce(response_from_the_action_function, false, false, false);
			w2dc_show_more_button_processing = false;
			w2dc_delete_iloader_from_element(button);
			if (response_from_the_action_function.hide_show_more_listings_button) {
				button.hide();
			}
		}
	}

	if (w2dc_js_objects.ajax_load) {
		$("form.w2dc-search-form-submit").each(function() {
			var form = $(this);
			if (form.find('.w2dc-submit-button-hidden').length) {
				var inputs = form.find('input, select').not(':input[type=text], :input[type=submit], :input[type=reset]');
				inputs.on("change", {"form": form}, function(e) {
					var form = e.data.form;
					
					w2dc_callAJAXSearch(form, e);
				});
			}
		});
		$("body").on("submit", ".w2dc-search-form-submit", function(e) {
			//e.preventDefault();
			
			w2dc_callAJAXSearch($(this), e);
		});
		var w2dc_callAJAXSearch = function(form, e) {
			var search_inputs = form.serializeArray();
			var post_params = {};
			for (var attr in search_inputs) {
				// CHECKBOXES WORKAROUND
				// checkboxes search form values should be populated especially,
				// and empty too (code for w2dc_setAjaxMarkers() you can find below)
				if (search_inputs[attr]['name'].indexOf('[]') != -1) {
					if (typeof post_params[search_inputs[attr]['name']] == 'undefined') {
						post_params[search_inputs[attr]['name']] = [];
					}
					post_params[search_inputs[attr]['name']].push(search_inputs[attr]['value']);
				} else {
					post_params[search_inputs[attr]['name']] = search_inputs[attr]['value'];
				}
			}
			
			var controller_hash = false;
			if (typeof post_params['hash'] != 'undefined' && post_params['hash']) {
				controller_hash = post_params['hash'];
			}

			if (!controller_hash) {
				if (typeof w2dc_controller_args_array != 'undefined' && Object.keys(w2dc_controller_args_array)) {
					for (var _controller_hash in w2dc_controller_args_array) {
						if ($("#w2dc-controller-"+_controller_hash).data("custom-home") == 1) {
							controller_hash = _controller_hash;
							post_params["custom_home"] = 1;
							post_params["controller"] = 'directory_controller';
							break;
						}
					}
				}
			}
			if (!controller_hash) {
				$(".w2dc-maps-canvas").each(function() {
					if (form.data("custom-home") == 1) {
						controller_hash = form.data("shortcode-hash");
						post_params["custom_home"] = 1;
						post_params["controller"] = 'directory_controller';
						return false;
					}
				});
			}

			if (controller_hash) {
				e.preventDefault();

				var search_button_obj = null;
				if (form.find('button[type="submit"]')) {
					search_button_obj = form.find('button[type="submit"]');
					if (search_button_obj.is(":visible")) {
						w2dc_add_iloader_on_element(search_button_obj);
					}
				}

				post_params['hash'] = controller_hash;

				var ajax_params = {'action': 'w2dc_controller_request'};
				// collect needed params from listing block
				var listings_args_array;
				if (listings_args_array = w2dc_get_controller_args_array(controller_hash)) {
					ajax_params.hide_order = listings_args_array.hide_order;
					ajax_params.hide_count = listings_args_array.hide_count;
					ajax_params.hide_content = listings_args_array.hide_content;
					ajax_params.hide_paginator = listings_args_array.hide_paginator;
					ajax_params.show_views_switcher = listings_args_array.show_views_switcher;
					ajax_params.listings_view_type = listings_args_array.listings_view_type;
					ajax_params.listings_view_grid_columns = listings_args_array.listings_view_grid_columns;
					ajax_params.listing_thumb_width = listings_args_array.listing_thumb_width;
					ajax_params.wrap_logo_list_view = listings_args_array.wrap_logo_list_view;
					ajax_params.logo_animation_effect = listings_args_array.logo_animation_effect;
					ajax_params.grid_view_logo_ratio = listings_args_array.grid_view_logo_ratio;
					ajax_params.scrolling_paginator = listings_args_array.scrolling_paginator;
					ajax_params.perpage = listings_args_array.perpage;
					ajax_params.onepage = listings_args_array.onepage;
					// do not send order params by defaut, send them when already was a click on order buttons, and we prevent failure when ordering by distance
					if (w2dc_find_get_parameter('order_by')) {
						ajax_params.order = listings_args_array.order;
						ajax_params.order_by = listings_args_array.order_by;
						post_params["order"] = listings_args_array.order;
						post_params["order_by"] = listings_args_array.order_by;
					}
					ajax_params.base_url = listings_args_array.base_url;
					if (typeof listings_args_array.directories != 'undefined') {
						ajax_params.directories = listings_args_array.directories;
					}
				}
				// collect needed params from map attributes
				if (typeof ajax_params.perpage == 'undefined') {
					var map_attrs_array;
					if (map_attrs_array = w2dc_get_map_markers_attrs_array(controller_hash))
						if (typeof map_attrs_array.map_attrs.num != 'undefined')
							ajax_params.perpage = map_attrs_array.map_attrs.num;
				}

				if ($("#w2dc-maps-canvas-"+controller_hash).length) {
					var map_attrs_array;
					if (map_attrs_array = w2dc_get_map_markers_attrs_array(controller_hash)) {
						
						// CHECKBOXES WORKAROUND
						for (var attrname in map_attrs_array.map_attrs) {
							// this is checkbox field from previous search and it is empty now
							if (attrname.indexOf('[]') != -1 && typeof post_params[attrname] == 'undefined') {
								delete map_attrs_array.map_attrs[attrname];
							}
						}
						// save new search parameters for the map
						for (var attrname in post_params) { map_attrs_array.map_attrs[attrname] = post_params[attrname]; }
	
						// repair ajax_loading after w2dc_drawFreeHandPolygon
						if (typeof w2dc_get_original_map_markers_attrs_array(controller_hash).map_attrs.ajax_loading != 'undefined' && w2dc_get_original_map_markers_attrs_array(controller_hash).map_attrs.ajax_loading == 1) {
							map_attrs_array.map_attrs.ajax_loading = 1;
							w2dc_setAjaxMarkersListener(controller_hash)
						}
						// remove drawing_state after w2dc_drawFreeHandPolygon
						if (typeof map_attrs_array.map_attrs.drawing_state != 'undefined') {
							delete map_attrs_array.map_attrs.drawing_state;
						}
						if (typeof map_attrs_array.map_attrs.ajax_loading != 'undefined' && map_attrs_array.map_attrs.ajax_loading == 1) {
							delete map_attrs_array.map_attrs.locations;
							delete map_attrs_array.map_attrs.swLat;
							delete map_attrs_array.map_attrs.swLng;
							delete map_attrs_array.map_attrs.neLat;
							delete map_attrs_array.map_attrs.neLng;
							delete map_attrs_array.map_attrs.action;
							var enable_clusters = map_attrs_array.enable_clusters;
							var enable_radius_circle = map_attrs_array.enable_radius_circle;
							var show_summary_button = map_attrs_array.show_summary_button;
							var show_readmore_button = map_attrs_array.show_readmore_button;
	
							map_attrs_array.map_attrs.include_categories_children = 1;
							w2dc_setAjaxMarkers(w2dc_maps[controller_hash], controller_hash, search_button_obj);
							return false;
						}
					}
				}
				
				if ($("#w2dc-map-listings-panel-"+controller_hash).length) {
					post_params.map_listings = 1;
					w2dc_ajax_loader_target_show($("#w2dc-map-search-panel-wrapper-"+controller_hash));
				}

				if ($("#w2dc-controller-"+controller_hash).length) {
					if (form.hasClass('w2dc-map-search-form')) {
						var anchor = false;
					} else {
						if (form.data("w2dc-scroll-to") == "listings") {
							var anchor = $('#w2dc-controller-'+controller_hash);
						} else if (form.data("w2dc-scroll-to") == "map") {
							var anchor = $('#w2dc-maps-canvas-'+controller_hash);
						}
					}
					if (typeof window["w2dc_sticky_scroll_toppadding_"+controller_hash] != 'undefined') {
						var sticky_scroll_toppadding = window["w2dc_sticky_scroll_toppadding_"+controller_hash];
					} else {
						var sticky_scroll_toppadding = 0;
					}
					w2dc_ajax_loader_target_show($('#w2dc-controller-'+controller_hash), anchor, sticky_scroll_toppadding);
				} else {
			   		post_params.without_listings = 1;
				}

				for (var attrname in ajax_params) { post_params[attrname] = ajax_params[attrname]; }

				if ($("#w2dc-maps-canvas-"+controller_hash).length) {
					w2dc_ajax_loader_target_show($('#w2dc-maps-canvas-'+controller_hash));
			   		post_params.with_map = 1;
			   		if (map_attrs_array && (typeof map_attrs_array.map_attrs.map_markers_is_limit == 'undefined' || map_attrs_array.map_attrs.map_markers_is_limit == 1)) {
			   			post_params.map_markers_is_limit = 1;
			   		}
			   	}
				
				window.w2dc_geocoderResponseOnSearch = function(success, lat, lng) {
					post_params.start_latitude = 0;
					post_params.start_longitude = 0;
					if (success) {
						post_params.start_latitude = lat;
						post_params.start_longitude = lng;
					}
					w2dc_startAJAXSearch(post_params, search_button_obj);
				}

				if (
						typeof post_params.address != 'undefined' &&
						post_params.address &&
						typeof post_params.radius != 'undefined' &&
						post_params.radius &&
						typeof w2dc_geocodeAddress != 'undefined'
				) {
					w2dc_geocodeAddress(post_params.address, w2dc_geocoderResponseOnSearch);
				} else {
					w2dc_startAJAXSearch(post_params, search_button_obj);
				}
			} else {
				form.find('button.w2dc-submit-button-hidden').trigger('click');
			}
		}
		var w2dc_search_requests_counter = 0;
		var w2dc_startAJAXSearch = function(post_params, search_button_obj) {
			
			window.history.pushState("", "", "?"+$.param(post_params));
			var url = document.location.pathname;
			for (var attrname in post_params) {
				var sep = (url.indexOf('?') > -1) ? '&' : '?';
				url = url + sep + attrname + '=' + post_params[attrname];
			}
			if (typeof ga == 'function') {
				ga('send', 'pageview', url);
			}
			
			w2dc_search_requests_counter++;
			$.post(
				w2dc_js_objects.ajaxurl,
				post_params,
				w2dc_completeAJAXSearch(search_button_obj),
				'json'
			);
		}
		var w2dc_completeAJAXSearch = function(search_button_obj) {
			return function(response_from_the_action_function) {
				w2dc_search_requests_counter--;
				if (w2dc_search_requests_counter == 0) {
					w2dc_process_listings_ajax_responce(response_from_the_action_function, true, true, true);
					if (search_button_obj) {
						w2dc_delete_iloader_from_element(search_button_obj);
					}
				}
			}
		}

		$('body').on('click', '.w2dc-listings-orderby-link', function(e) {
			e.preventDefault();

			var href = $(this).attr('href');
			var controller_hash = $(this).data('controller-hash');
			var listings_args_array;
			if (listings_args_array = w2dc_get_controller_args_array(controller_hash)) {
				var post_params = $.extend({}, listings_args_array);
				var ajax_params = {'action': 'w2dc_controller_request', 'order_by': $(this).data('orderby'), 'order': $(this).data('order'), 'paged': 1, 'hash': controller_hash};
				for (var attrname in ajax_params) { post_params[attrname] = ajax_params[attrname]; }

				if ($("#w2dc-maps-canvas-"+controller_hash).length) {
					var map_attrs_array;
					if (map_attrs_array = w2dc_get_map_markers_attrs_array(controller_hash)) {
						if ((typeof map_attrs_array.map_attrs.ajax_loading == 'undefined' || map_attrs_array.map_attrs.ajax_loading == 0)
						&&
						(typeof map_attrs_array.map_attrs.drawing_state == 'undefined' || map_attrs_array.map_attrs.drawing_state == 0)
						&&
						(typeof map_attrs_array.map_attrs.map_markers_is_limit == 'undefined' || map_attrs_array.map_attrs.map_markers_is_limit == 1)) {
							w2dc_ajax_loader_target_show($('#w2dc-maps-canvas-'+controller_hash));
						  	post_params.with_map = 1;
						  	post_params.map_markers_is_limit = 1;
						  	if ($("#w2dc-map-listings-panel-"+controller_hash).length) {
								post_params.map_listings = 1;
								w2dc_ajax_loader_target_show($("#w2dc-map-search-panel-wrapper-"+controller_hash));
							}
						} else {
							post_params.with_map = 0;
							post_params.map_listings = 0;
						}
							
					}
				}
				
				window.history.pushState("", "", href);

				w2dc_ajax_loader_target_show($('#w2dc-controller-'+controller_hash));
				$.post(
					w2dc_js_objects.ajaxurl,
					post_params,
					function(response_from_the_action_function) {
						w2dc_process_listings_ajax_responce(response_from_the_action_function, true, true, true);
					},
					'json'
				);
			}
		});

		$('body').on('click', '.w2dc-pagination li.w2dc-active a', function(e) {
			e.preventDefault();
		});
		$('body').on('click', '.w2dc-listings-block .w2dc-pagination li a', function(e) {
			if ($(this).data('controller-hash')) {
				e.preventDefault();

				var href = $(this).attr('href');
				var controller_hash = $(this).data('controller-hash');
				var paged = $(this).data('page');
				var listings_args_array;
				if (listings_args_array = w2dc_get_controller_args_array(controller_hash)) {
					var post_params = $.extend({}, listings_args_array);
					
					var existing_listings = '';
					$("#w2dc-controller-"+controller_hash+" .w2dc-listings-block-content article").each(function(index) {
						existing_listings = $(this).attr("id").replace("post-", "") + "," + existing_listings;
					});

					var ajax_params = {'action': 'w2dc_controller_request', 'paged': paged, 'existing_listings': existing_listings, 'hash': controller_hash};
					for (var attrname in ajax_params) { post_params[attrname] = ajax_params[attrname]; }
							
					if ($("#w2dc-maps-canvas-"+controller_hash).length) {
						var map_attrs_array;
						if (map_attrs_array = w2dc_get_map_markers_attrs_array(controller_hash))
							if ((typeof map_attrs_array.map_attrs.ajax_loading == 'undefined' || map_attrs_array.map_attrs.ajax_loading == 0)
							&&
							(typeof map_attrs_array.map_attrs.drawing_state == 'undefined' || map_attrs_array.map_attrs.drawing_state == 0)
							&&
							(typeof map_attrs_array.map_attrs.map_markers_is_limit == 'undefined' || map_attrs_array.map_attrs.map_markers_is_limit == 1)) {
								w2dc_ajax_loader_target_show($('#w2dc-maps-canvas-'+controller_hash));
							  	post_params.with_map = 1;
							  	post_params.map_markers_is_limit = 1;
							  	if ($("#w2dc-map-listings-panel-"+controller_hash).length) {
									post_params.map_listings = 1;
									w2dc_ajax_loader_target_show($("#w2dc-map-search-panel-wrapper-"+controller_hash));
								}
							} else {
								post_params.with_map = 0;
								post_params.map_listings = 0;
							}
					}
					var anchor = $('#w2dc-controller-'+controller_hash);
					
					window.history.pushState("", "", href);

					if (typeof window["w2dc_sticky_scroll_toppadding_"+controller_hash] != 'undefined') {
						var sticky_scroll_toppadding = window["w2dc_sticky_scroll_toppadding_"+controller_hash];
					} else {
						var sticky_scroll_toppadding = 0;
					}
					w2dc_ajax_loader_target_show($('#w2dc-controller-'+controller_hash), anchor, sticky_scroll_toppadding);
					$.post(
						w2dc_js_objects.ajaxurl,
						post_params,
						function(response_from_the_action_function) {
							w2dc_process_listings_ajax_responce(response_from_the_action_function, true, false, true);
						},
						'json'
					);
				}
			}
		});
	}
	
	// needed hack for mobile devices - draggable makes input text fields uneditable
	$('body').on('click', '.w2dc-map-search-wrapper input', function() {
	    $(this).focus();
	});

	$('body').on('click', '.w2dc-map-search-toggle, .w2dc-map-sidebar-toggle, .w2dc-map-sidebar-toggle-container-mobile', function(e) {
		e.preventDefault();
		var id = $(this).data('id');
		$("#w2dc-map-search-form-"+id).toggleClass("w2dc-sidebar-open");
		$("#w2dc-maps-canvas-"+id).toggleClass("w2dc-sidebar-open");
		$("#w2dc-map-search-panel-wrapper-"+id).on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
			w2dc_callMapResize(id);
		});
	});

	$('body').on('click', '.w2dc-list-view-btn', function() {
		var button = $(this);
		var hash = button.data('shortcode-hash');
		var listings_block = $('#w2dc-controller-'+hash).find('.w2dc-listings-block');
		if (listings_block.hasClass('w2dc-listings-grid')) {
			listings_block.find('.w2dc-listings-block-content').fadeTo("fast", 0, function() {
				button.removeClass('w2dc-btn-default').addClass('w2dc-btn-primary');
				button.parents('.w2dc-views-links').find('.w2dc-grid-view-btn').removeClass('w2dc-btn-primary').addClass('w2dc-btn-default');
				listings_block.removeClass('w2dc-listings-grid w2dc-listings-grid-1 w2dc-listings-grid-2 w2dc-listings-grid-3 w2dc-listings-grid-4');
				listings_block.addClass('w2dc-listings-list-view');
				listings_block.find('article.w2dc-listing').each(function() {
					$(this).css('height', 'auto');
				});
				$.cookie("w2dc_listings_view_"+hash, 'list', {expires: 365, path: "/"});
			});
			listings_block.find('.w2dc-listings-block-content').fadeTo("fast", 1);
		}
	});
	$('body').on('click', '.w2dc-grid-view-btn', function() {
		var button = $(this);
		var hash = button.data('shortcode-hash');
		var listings_block = $('#w2dc-controller-'+hash).find('.w2dc-listings-block');
		if (!listings_block.hasClass('w2dc-listings-grid')) {
			listings_block.find('.w2dc-listings-block-content').fadeTo("fast", 0, function() {
				button.removeClass('w2dc-btn-default').addClass('w2dc-btn-primary');
				button.parents('.w2dc-views-links').find('.w2dc-list-view-btn').removeClass('w2dc-btn-primary').addClass('w2dc-btn-default');
				listings_block.removeClass('w2dc-listings-list-view');
				listings_block.addClass('w2dc-listings-grid').addClass('w2dc-listings-grid-'+button.data('grid-columns'));
				w2dc_equalColumnsHeight();
				$.cookie("w2dc_listings_view_"+hash, 'grid', {expires: 365, path: "/"});
			});
			listings_block.find('.w2dc-listings-block-content').fadeTo("fast", 1);
		}
	});
	
	$('body').on('click', ".w2dc-remove-from-favourites-list", function() {
		var listing_id = $(this).attr("listingid");
		
		if ($.cookie("favourites") != null) {
			var favourites_array = $.cookie("favourites").split('*');
		} else {
			var favourites_array = new Array();
		}

		for (var count=0; count<favourites_array.length; count++) {
			if (favourites_array[count] == listing_id) {
				delete favourites_array[count];
			}
		}

		$(".w2dc-listing#post-"+listing_id).remove();
		
		$.cookie("favourites", favourites_array.join('*'), {expires: 365, path: "/"});
		return false;
	});
	
	// Select FA icon dialog
	$(document).on("click", ".w2dc-select-fa-icon", function() {
		var dialog_title = $(this).text();
		var icon_image_name = $(this).data("icon-image-name");
		var icon_image_name_obj = $("#"+icon_image_name);
		var icon_tag = $(this).data("icon-tag");
		var icon_tag_obj = $("."+icon_tag);
		
		var icon_click_event;
		var reset_icon_click_event;
		
		var dialog_obj = $('<div id="w2dc-select-fa-icon-dialog"></div>');
		dialog_obj.dialog({
			dialogClass: 'w2dc-content',
			width: ($(window).width()*0.5),
			height: ($(window).height()*0.8),
			modal: true,
			resizable: false,
			draggable: false,
			title: dialog_title,
			open: function() {
				w2dc_ajax_loader_show();
				$.ajax({
					type: "POST",
					url: w2dc_js_objects.ajaxurl,
					data: {'action': 'w2dc_select_fa_icon'},
					dataType: 'html',
					success: function(response_from_the_action_function){
						if (response_from_the_action_function != 0) {
							dialog_obj.html(response_from_the_action_function);
							if (icon_image_name_obj.val()) {
								$("#"+icon_image_name_obj.val()).addClass("w2dc-selected-icon");
							}

							icon_click_event = $(document).one("click", ".w2dc-fa-icon", function() {
								$(".w2dc-selected-icon").removeClass("w2dc-selected-icon");
								icon_image_name_obj.val($(this).attr('id'));
								icon_tag_obj.removeClass().addClass(icon_tag+' w2dc-icon-tag w2dc-fa '+icon_image_name_obj.val());
								icon_tag_obj.show();
								$(this).addClass("w2dc-selected-icon");
								reset_icon_click_event.off("click", "#w2dc-reset-fa-icon");
								dialog_obj.remove();
							});
							reset_icon_click_event = $(document).one("click", "#w2dc-reset-fa-icon", function() {
								$(".w2dc-selected-icon").removeClass("w2dc-selected-icon");
								icon_tag_obj.removeClass().addClass(icon_tag+' w2dc-icon-tag');
								icon_tag_obj.hide();
								icon_image_name_obj.val('');
								icon_click_event.off("click", ".w2dc-fa-icon");
								dialog_obj.remove();
							});
						}
					},
					complete: function() {
						w2dc_ajax_loader_hide();
					}
				});
				$(document).on("click", ".ui-widget-overlay", function() {
					icon_click_event.off("click", ".w2dc-fa-icon");
					reset_icon_click_event.off("click", "#w2dc-reset-fa-icon");
					dialog_obj.remove();
				});
			},
			close: function() {
				icon_click_event.off("click", ".w2dc-fa-icon");
				reset_icon_click_event.off("click", "#w2dc-reset-fa-icon");
				dialog_obj.remove();
			}
		});
	});
	
	// AJAX Contact form
	$(document).on('submit', '#w2dc_contact_form, #w2dc_report_form', function(e) {
		e.preventDefault();

		var $this = $(this);
		
		if ($this.attr('id') == 'w2dc_contact_form') {
			var type = 'contact';
		} else if ($this.attr('id') == 'w2dc_report_form') {
			var type = 'report';
		}
		var warning = $this.find('#'+type+'_warning');
		var listing_id = $this.find('#'+type+'_listing_id');
		var nonce = $this.find('#'+type+'_nonce');
		var name = $this.find('#'+type+'_name');
		var email = $this.find('#'+type+'_email');
		var message = $this.find('#'+type+'_message');
		var button = $this.find('.w2dc-send-message-button');
		var recaptcha = ($this.find('.g-recaptcha-response').length ? $this.find('.g-recaptcha-response').val() : '');
		
		$this.css('opacity', '0.5');
		warning.hide();
		button.val(w2dc_js_objects.send_button_sending).attr('disabled', 'disabled');

		var data = {
				action: "w2dc_contact_form",
				type: type,
				listing_id: listing_id.val(),
				name: name.val(),
				email: email.val(),
				message: message.val(),
				security: nonce.val(),
				'g-recaptcha-response': recaptcha
		};

		$.ajax({
				url: w2dc_js_objects.ajaxurl,
				type: "POST",
				dataType: "json",
				data: data,
				global: false,
				success: function(response_from_the_action_function) {
					if (response_from_the_action_function != 0) {
						if (response_from_the_action_function.error == '') {
							name.val(''),
							email.val(''),
							message.val(''),
							warning.html(response_from_the_action_function.success).show();
						} else {
							var error;
							if (typeof response_from_the_action_function.error == 'object') {
								error = '<ul>';
								$.each(response_from_the_action_function.error, function(key, value) {
									error = error + '<li>' + value + '</li>';
								});
	            				error = error + '</ul>';
	            			} else {
	            				error = response_from_the_action_function.error;
	            			}
							warning.html(error).show();
	            		}
	            		$this.css('opacity', '1');
	            		button.val(w2dc_js_objects.send_button_text).removeAttr('disabled');
					}
				}
		});
	});
})(jQuery);


function w2dc_make_slug(name) {
	name = name.toLowerCase();
	
	var defaultDiacriticsRemovalMap = [
	                                   {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
	                                   {'base':'AA','letters':/[\uA732]/g},
	                                   {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
	                                   {'base':'AO','letters':/[\uA734]/g},
	                                   {'base':'AU','letters':/[\uA736]/g},
	                                   {'base':'AV','letters':/[\uA738\uA73A]/g},
	                                   {'base':'AY','letters':/[\uA73C]/g},
	                                   {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
	                                   {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
	                                   {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
	                                   {'base':'DZ','letters':/[\u01F1\u01C4]/g},
	                                   {'base':'Dz','letters':/[\u01F2\u01C5]/g},
	                                   {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
	                                   {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
	                                   {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
	                                   {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
	                                   {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
	                                   {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
	                                   {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
	                                   {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
	                                   {'base':'LJ','letters':/[\u01C7]/g},
	                                   {'base':'Lj','letters':/[\u01C8]/g},
	                                   {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
	                                   {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
	                                   {'base':'NJ','letters':/[\u01CA]/g},
	                                   {'base':'Nj','letters':/[\u01CB]/g},
	                                   {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
	                                   {'base':'OI','letters':/[\u01A2]/g},
	                                   {'base':'OO','letters':/[\uA74E]/g},
	                                   {'base':'OU','letters':/[\u0222]/g},
	                                   {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
	                                   {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
	                                   {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
	                                   {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
	                                   {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
	                                   {'base':'TZ','letters':/[\uA728]/g},
	                                   {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
	                                   {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
	                                   {'base':'VY','letters':/[\uA760]/g},
	                                   {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
	                                   {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
	                                   {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
	                                   {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
	                                   {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
	                                   {'base':'aa','letters':/[\uA733]/g},
	                                   {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
	                                   {'base':'ao','letters':/[\uA735]/g},
	                                   {'base':'au','letters':/[\uA737]/g},
	                                   {'base':'av','letters':/[\uA739\uA73B]/g},
	                                   {'base':'ay','letters':/[\uA73D]/g},
	                                   {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
	                                   {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
	                                   {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
	                                   {'base':'dz','letters':/[\u01F3\u01C6]/g},
	                                   {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
	                                   {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
	                                   {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
	                                   {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
	                                   {'base':'hv','letters':/[\u0195]/g},
	                                   {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
	                                   {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
	                                   {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
	                                   {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
	                                   {'base':'lj','letters':/[\u01C9]/g},
	                                   {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
	                                   {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
	                                   {'base':'nj','letters':/[\u01CC]/g},
	                                   {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
	                                   {'base':'oi','letters':/[\u01A3]/g},
	                                   {'base':'ou','letters':/[\u0223]/g},
	                                   {'base':'oo','letters':/[\uA74F]/g},
	                                   {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
	                                   {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
	                                   {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
	                                   {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
	                                   {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
	                                   {'base':'tz','letters':/[\uA729]/g},
	                                   {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
	                                   {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
	                                   {'base':'vy','letters':/[\uA761]/g},
	                                   {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
	                                   {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
	                                   {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
	                                   {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
	                               ];
	for(var i=0; i<defaultDiacriticsRemovalMap.length; i++)
		name = name.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);

	//change spaces and other characters by '_'
	name = name.replace(/\W/gi, "_");
	// remove double '_'
	name = name.replace(/(\_)\1+/gi, "_");
	
	return name;
}

function w2dc_in_array(val, arr) 
{
	for (var i = 0; i < arr.length; i++) {
		if (arr[i] == val)
			return i;
	}
	return false;
}

function w2dc_find_get_parameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}


/*!
 * jQuery Mousewheel 3.1.13 -------------------------------------------------------------------------------------------------------------------------------------------
 *
 * Copyright 2015 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});


// tax_dropdowns.js -------------------------------------------------------------------------------------------------------------------------------------------
(function($) {
	"use strict";
	
	window.w2dc_sort_autocomplete_items = function(a, b) {
		if (typeof a.is_listing != "undefined" && a.is_listing && (typeof b.is_listing == "undefined" || !b.is_listing)) {
			return -1;
		} else if (typeof a.is_listing == "undefined" || !a.is_listing) {
			if (a.term_in_name && !b.term_in_name) {
				return -1;
			} else if (!a.term_in_name && b.term_in_name) {
				return 1;
			} else if (a.is_term && !b.is_term) {
				return -1;
			} else if (!a.is_term && b.is_term) {
				return 1;
			} else if (a.parents == '' && b.parents != '') {
				return -1;
			} else if (a.parents != '' && b.parents == '') {
				return 1;
			} else if (a.name > b.name) {
				return 1;
			} else if (b.name > a.name) {
				return -1;
			} else {
				return 0;
			}
		}
	}
	
	if (typeof $.ui != 'undefined' && typeof $.ui.selectmenu != 'undefined' && typeof $.ui.autocomplete != 'undefined') {
		// search suggestions links
		$(document).on("click", ".w2dc-search-suggestions a", function() {
			var input = $(this).parents(".w2dc-search-input-field-wrap").find(".w2dc-main-search-field");
			var value = $(this).text();

			input.val(value)
			.trigger("focus")
			.trigger("change");
			
			if (input.hasClass('ui-autocomplete-input')) {
				input.autocomplete("search", value);
			}
		});
		// redirect to listing
		$(document).on("click", ".w2dc-dropdowns-menu a", function() {
			if ($(this).attr("target") == "_blank") {
				window.open($(this).attr("href"), '_blank');
			} else {
				window.location = $(this).attr("href");
			}
		});
		// correct menu width
		$.ui.autocomplete.prototype._resizeMenu = function () {
			var ul = this.menu.element;
			ul.outerWidth(this.element.outerWidth());
		}
		
		$(document).on('change paste keyup', '.w2dc-main-search-field', function() {
			var input = $(this);
			if (input.val()) {
				input.parent().find(".w2dc-dropdowns-menu-button").addClass("w2dc-search-input-reset");
			} else {
				input.parent().find(".w2dc-dropdowns-menu-button").removeClass("w2dc-search-input-reset");
			}
		});
		

		window.categories_combobox = $.widget("custom.categories_combobox", {
			input_icon_class: "w2dc-glyphicon-search",
			cache: new Object(),

			_create: function() {
				this.wrapper = $("<div>")
				.addClass("w2dc-dropdowns-menu-categories-autocomplete")
				.insertAfter(this.element);

				this.element.hide();
				this._createAutocomplete();
				this._createShowAllButton();
			},

			_appendWrapper: function() {
				// when combobox is placed on sticky map or sticky search - append to its wrapper
				if (this.wrapper.parents(".w2dc-maps-canvas-wrapper.w2dc-sticky-scroll, .w2dc-search-form.w2dc-sticky-scroll").length) {
					var append_to = this.wrapper;
				} else {
					var append_to = null;
				}
				return append_to;
			},
			
			_autocompleteWithOptions: function(input) {
				input.autocomplete({
					delay: 300,
					minLength: 0,
					appendTo: this._appendWrapper(),
					source: $.proxy(this, "_source"),
					open: function(event, ui) {
						if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
							$('.ui-autocomplete').off('menufocus hover mouseover mouseenter');
						}
					}/*,
					close: function() {
						input.trigger("focus");
						input.autocomplete("search", "");
					}*/
				});
			},
			
			_autocompleteRenderItem: function(input) {
				var default_icon_url = this.element.data('default-icon');
				
				input.autocomplete("widget").addClass("w2dc-dropdowns-menu");
				input.autocomplete("instance")._renderItem = function(ul, item) {
					var label = item.label;
					
					var right_side_markup = '';
					if (typeof item.count != "undefined") {
						right_side_markup = '<span class="w2dc-dropdowns-menu-search-counter">' + item.count + '</span>';
					}
					if (typeof item.note != "undefined") {
						right_side_markup = '<span class="w2dc-dropdowns-menu-search-note">' + item.note + '</span>';
					}
					
					var item_class = "w2dc-dropdowns-menu-search";
					if (typeof item.is_term != "undefined" && item.is_term) {
						item_class = item_class + " w2dc-dropdowns-menu-search-term";
					}
					if (typeof item.is_listing != "undefined" && item.is_listing) {
						item_class = item_class + " w2dc-dropdowns-menu-search-listing";
					}

					var li = $("<li>"),
					wrapper = $("<div>", {
						html: label + right_side_markup,
						class: item_class
					});

					var icon_class = "ui-icon";
					var icon_url;
					if (item.icon) {
						icon_url = item.icon;
					} else {
						icon_url = default_icon_url;
					}
					$("<span>", {
						style: "background-image: url('" + icon_url + "'); background-size: cover;",
						class: icon_class
					})
					.appendTo(wrapper);

					if (item.sublabel) {
						var sublabel = item.sublabel;

						$("<span>")
						.html(sublabel)
						.addClass("w2dc-dropdowns-menu-search-sublabel")
						.appendTo(wrapper);
					} else {
						wrapper.addClass("w2dc-dropdowns-menu-search-root");
					}
		
					return li.append(wrapper).appendTo(ul);
				};
			},
			
			_openMobileKeyboard: function() {
				if (typeof this.element.data("autocomplete-name") == 'undefined' && screen.height <= 768) {
					return false;
				} else {
					return true;
				}
			},
			
			_createAutocomplete: function() {
				var selected = this.element.find("[data-selected=\"selected\"]");
				if (this.element.data("autocomplete-name") && this.element.data("autocomplete-value")) {
					var value = this.element.data("autocomplete-value");
				} else {
					var value = selected.data("name") ? selected.data("name") : "";
				}

				this.input = $("<input>", {
							name: this.element.data("autocomplete-name") ? this.element.data("autocomplete-name") : "",
							readonly: this._openMobileKeyboard() ? false : true
				})
				.appendTo(this.wrapper)
				.val(value)
				.attr("placeholder", this.element.data("placeholder"))
				.addClass("w2dc-form-control w2dc-main-search-field");
				
				this._autocompleteWithOptions(this.input);
				this._autocompleteRenderItem(this.input);

				var input = this.input;
				var id = this.element.data("id");

				this._on(input, {
					autocompleteselect: function(event, ui) {
						this._trigger("select", event, {
							item: ui.item
						});

						if (ui.item.is_term) {
							var name = ui.item.name;
							$('#selected_tax\\['+id+'\\]').val(ui.item.value);
							$('#selected_tax_text\\['+id+'\\]').val(ui.item.full_value);
						} else {
							var name = ui.item.value;
							$('#selected_tax\\['+id+'\\]').val('');
							$('#selected_tax_text\\['+id+'\\]').val('');
						}
						// trigger custom event
						$('#selected_tax\\['+id+'\\]').trigger("w2dc:selected_tax_change");
						
						name = $('<textarea />').html(name).text(); // HTML Entity Decode
						this.input.val(name);
						this.input.trigger('change');
						
						var form = this.input.parents("form");
						if (form.find('.w2dc-submit-button-hidden').length) {
							form.trigger("submit");
						}

						event.preventDefault();
					},
					autocompletefocus: function(event, ui) {
						event.preventDefault();
					},
					click: function(event, ui) {
						if (this._openMobileKeyboard()) {
							input.trigger("focus");
							input.autocomplete("search", input.val());
							
							if ($("body").hasClass("w2dc-touch")) {
								this._scrollToInputTop(input);
							}
						} else {
							input.trigger("focusout");
							input.autocomplete("search", '');
						}
					},
					autocompletesearch: function(event, ui) {
						if (input.val() == '') {
							$('#selected_tax\\['+id+'\\]').val('');
							$('#selected_tax_text\\['+id+'\\]').val('');
							
							// trigger custom event
							$('#selected_tax\\['+id+'\\]').trigger("w2dc:selected_tax_change");
						}
					}
				});
				
				$(document).on("submit", "form", function() {
					input.autocomplete("close");
				});
			},
			
			_scrollToInputTop: function(input) {
				$('html, body').animate({
					scrollTop: input.offset().top
				}, 500);
			},

			_createShowAllButton: function() {
				var input = this.input,
				_this = this,
				wasOpen = false,
				id = this.element.data("id");

				this.wrapper.addClass("w2dc-has-feedback");
				$("<span>", {
					class: "w2dc-dropdowns-menu-button w2dc-glyphicon w2dc-form-control-feedback " + this.input_icon_class + (input.val() ? " w2dc-search-input-reset" : "")
				})
				.appendTo(this.wrapper)
				.on("mousedown", function() {
					wasOpen = input.autocomplete("widget").is(":visible");
				})
				.on("click", function(e) {
					input.trigger("focus");
					
					if ($(this).hasClass("w2dc-search-input-reset")) {
						input.val('');
						// if it is get my location button - remove reset button later, when geolocation will start
						if (!$(this).hasClass('w2dc-get-location')) {
							$(this).removeClass('w2dc-search-input-reset');
						}
						
						// submit search form on input reset
						$('#selected_tax\\['+id+'\\]').val('');
						$('#selected_tax_text\\['+id+'\\]').val('').trigger("change");
						
						// trigger custom event
						$('#selected_tax\\['+id+'\\]').trigger("w2dc:selected_tax_change");
					}

					// Close if already visible
					if (wasOpen) {
						return;
					}

					if (_this._openMobileKeyboard()) {
						//input.autocomplete("search", input.val());
					} else {
						// Pass empty string as value to search for, displaying all results
						input.autocomplete("search", '');
					}
				});
			},

			_source: function(request, response) {
				var term = $.trim(request.term).toLowerCase();
				var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
				var common_array = [];
				
				this.element.children("option").map(function() {
					var text = $(this).text(),
					value = $(this).val(),
					name = $(this).data("name"),
					icon = $(this).data("icon"),
					count = $(this).data("count"),
					note = $(this).data("note"),
					sublabel = $(this).data("sublabel"),
					term_in_name = matcher.test(name),
					term_in_sublabel = matcher.test(sublabel);
					if (this.value && (!term || term_in_name || term_in_sublabel)) {
						common_array.push({
							label: text,
							value: value,
							name: name,
							full_value: name + ', ' + sublabel,
							count: count,
							note: note,
							icon: icon,
							sublabel: sublabel,
							option: this,
							is_term: true,
							is_listing: false,
							term_in_name: term_in_name
						});
					}
				});

				if (this.element.data("ajax-search") && term) {
					this.wrapper.find(".w2dc-dropdowns-menu-button").addClass("w2dc-search-input-loader");

					if (term in this.cache) {
						var cache_array = this.cache[term];
						this.wrapper.find(".w2dc-dropdowns-menu-button").removeClass("w2dc-search-input-loader");
						common_array = cache_array.slice(0); // simply duplicate this array

						response(common_array);
					} else {
						if (this.input.parents("form").find("[name=directories]").length) {
							var directories = this.input.parents("form").find("[name=directories]").val();
						} else {
							var directories = 0; 
						}
						
						$.ajax({
				        	url: w2dc_js_objects.ajaxurl,
				        	type: "POST",
				        	dataType: "json",
				            data: {
				            	action: 'w2dc_keywords_search',
				            	term: term,
				            	directories: directories
				            },
				            combobox: this,
				            success: function(response_from_the_action_function){
				            	if (response_from_the_action_function != 0 && response_from_the_action_function.listings) {
				            		var cache_array = [];
				            		response_from_the_action_function.listings.map(function(listing) {
				            			var item = {
											label: listing.title,      // text in option
											value: listing.name,      // value depends on is_term
											name: listing.name,       // text to place in input
											full_value: listing.name,       // full value of the item
											icon: listing.icon,
											sublabel: listing.sublabel,  // sub-description
											option: listing,
											is_term: false,
											is_listing: true,
											term_in_name: true
										}
				            			common_array.push(item);
				            			cache_array.push(item);
				            		});
				            		common_array.sort(w2dc_sort_autocomplete_items);

				            		this.combobox.cache[term] = common_array;
				            	}
				            	response(common_array);
				            },
				            complete: function() {
				            	this.combobox.wrapper.find(".w2dc-dropdowns-menu-button").removeClass("w2dc-search-input-loader");
				            }
				        });
					}
				} else {
					if (term) {
						common_array.sort(w2dc_sort_autocomplete_items);
					}
					response(common_array);
				}
			},

			_destroy: function() {
				this.wrapper.remove();
				this.element.show();
			}
		});
		window.keywords_autocomplete = $.widget("custom.keywords_autocomplete", categories_combobox, {
			cache: new Object(),

			_create: function() {
				this.wrapper = this.element.parent();
				this.wrapper.addClass("w2dc-dropdowns-menu-keywords-autocomplete");

				this._createAutocomplete();
				this._createShowAllButton();
			},
			
			_createAutocomplete: function() {
				this._autocompleteWithOptions(this.element);
				this._autocompleteRenderItem(this.element);
				
				var input = this.element;
				this.input = input;

				this._on(input, {
					autocompleteselect: function(event, ui) {
						this._trigger("select", event, {
							item: ui.item
						});

						input.val(ui.item.value);
						input.trigger('change');

						event.preventDefault();
					},
					autocompletefocus: function(event, ui) {
						event.preventDefault();
					},
					click: function(event, ui) {
						input.trigger("focus");
						input.autocomplete("search", input.val());
						
						if ($("body").hasClass("w2dc-touch")) {
							this._scrollToInputTop(input);
						}
					}
				});
			},

			_source: function(request, response) {
				var term = $.trim(request.term).toLowerCase();
				var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
				var common_array = [];
				
				if (term) {
					this.wrapper.find(".w2dc-dropdowns-menu-button").addClass("w2dc-search-input-loader");

					if (term in this.cache) {
						var cache_array = this.cache[term];
						this.wrapper.find(".w2dc-dropdowns-menu-button").removeClass("w2dc-search-input-loader");
						common_array = cache_array.slice(0); // simply duplicate this array
						response(common_array);
					} else {
						if (this.element.parents("form").find("[name=directories]").length) {
							var directories = this.element.parents("form").find("[name=directories]").val();
						} else {
							var directories = 0; 
						}
						
						$.ajax({
							url: w2dc_js_objects.ajaxurl,
							type: "POST",
							dataType: "json",
							data: {
								action: 'w2dc_keywords_search',
								term: term,
								directories: directories
							},
							combobox: this,
							success: function(response_from_the_action_function){
								if (response_from_the_action_function != 0 && response_from_the_action_function.listings) {
									response_from_the_action_function.listings.map(function(listing) {
										var item = {
												label: listing.title,      // text in option
												value: listing.name,      // value depends on is_term
												name: listing.name,       // text to place in input
												full_value: listing.name,       // full value of the item
												icon: listing.icon,
												sublabel: listing.sublabel,  // sub-description
												option: listing,
												is_term: false,
												is_listing: true,
												term_in_name: true
										}
										common_array.push(item);
									});
									common_array.sort(w2dc_sort_autocomplete_items);

									this.combobox.cache[term] = common_array;
								}
								response(common_array);
							},
							complete: function() {
								this.combobox.wrapper.find(".w2dc-dropdowns-menu-button").removeClass("w2dc-search-input-loader");
							}
						});
					}
				}
			},
		});
		window.locations_combobox = $.widget("custom.locations_combobox", categories_combobox, {
			input_icon_class: "w2dc-glyphicon-map-marker",
			placeholder: "",

			_create: function() {
				this.wrapper = $("<div>")
				.addClass("w2dc-dropdowns-menu-locations-autocomplete")
				.insertAfter(this.element);
				
				this.uID = this.element.data("id");
				this.placeholder = this.element.data("placeholder");

				this.element.hide();
				this._createAutocomplete();
				this._createShowAllButton();
				this._addMyLocationButton();
			},
			
			_createAutocomplete: function() {
				this._super();

				this._on(this.input, {
					autocompleteselect: function(event, ui) {
						var form = this.input.parents("form");
						var id = form.data("id");
						if ($("#radius_"+id).val() > 0 && form.find('.w2dc-submit-button-hidden').length) {
							form.trigger("submit");
						}
						this.input.trigger('change');
					}
				});
			},
			
			_addMyLocationButton: function() {
				if (w2dc_maps_objects.enable_my_location_button && this.element.data("autocomplete-name")) {
					this.wrapper.find(".w2dc-form-control-feedback").addClass("w2dc-get-location");
				}
			},

			_source: function(request, response) {
				var term = $.trim(request.term);
				
				var common_array = [];
				
				var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
				this.element.children("option").map(function() {
					var text = $(this).text(),
					value = $(this).val(),
					name = $(this).data("name"),
					icon = $(this).data("icon"),
					count = $(this).data("count"),
					note = $(this).data("note"),
					sublabel = $(this).data("sublabel"),
					term_in_name = matcher.test(name),
					term_in_sublabel = matcher.test(sublabel);
					if (this.value && (!term || term_in_name || term_in_sublabel)) {
						common_array.push({
							label: text,
							value: value,
							name: name,
							full_value: name + ', ' + sublabel,
							icon: icon,
							count: count,
							note: note,
							sublabel: sublabel,
							option: this,
							is_term: true,
							term_in_name: term_in_name
						});
					}
				});

				window.w2dc_collectLocationsPreditions = function(predictions, common_array, response) {
					$.map(predictions, function (prediction, i) {
						common_array.push({
							label: prediction.label,
							value: prediction.value,
							name: prediction.name,
							note: w2dc_js_objects.prediction_note,
							icon: "",
							sublabel: prediction.sublabel,
							is_term: false,
							term_in_name: true
						});
					})

					common_array.sort(w2dc_sort_autocomplete_items);
					response(common_array);
				}

				if (this.element.data("autocomplete-name")) {
					if (term && w2dc_maps_objects.address_autocomplete && typeof w2dc_autocompleteService != 'undefined') {
						w2dc_autocompleteService(term, w2dc_maps_objects.address_autocomplete_code, common_array, response, w2dc_collectLocationsPreditions);
					} else {
						if (term) {
							common_array.sort(w2dc_sort_autocomplete_items);
						}
						response(common_array);
					}
				} else {
					if (term) {
						common_array.sort(w2dc_sort_autocomplete_items);
					}
					response(common_array);
				}
			},
		});
		window.address_autocomplete = $.widget("custom.address_autocomplete", categories_combobox, {
				input_icon_class: "w2dc-glyphicon-map-marker",
				
				_create: function() {
					this.wrapper = this.element.parent();
					this.wrapper.addClass("w2dc-dropdowns-menu-locations-autocomplete");
					
					this._createAutocomplete();
					this._createShowAllButton();
					this._addMyLocationButton();
				},
			
			_addMyLocationButton: function() {
				if (w2dc_maps_objects.enable_my_location_button) {
					this.element.next(".w2dc-form-control-feedback").addClass("w2dc-get-location");
				}
			},
			
			_createAutocomplete: function() {
				this._autocompleteWithOptions(this.element);
				this._autocompleteRenderItem(this.element);

				var input = this.element;
				this.input = input;

				this._on(input, {
					autocompleteselect: function(event, ui) {
						this._trigger("select", event, {
							item: ui.item
						});

						input.val(ui.item.value);
						input.trigger('change');
						
						var form = input.parents("form");
						var id = form.data("id");
						if ($("#radius_"+id).val() > 0 && form.find('.w2dc-submit-button-hidden').length) {
							form.trigger("submit");
						}
						
						return false;
					},
					autocompletefocus: function(event, ui) {
						event.preventDefault();
					},
					click: function(event, ui) {
						input.trigger("focus");
						input.autocomplete("search", input.val());
						
						if ($("body").hasClass("w2dc-touch")) {
							this._scrollToInputTop(input);
						}
					}
				});
			},
			
			_autocompleteRenderItem: function(input) {
				this._super(input);

				this.element.autocomplete("widget").addClass("w2dc-dropdowns-menu-only-address");
			},
			
			_source: function(request, response) {
				var term = $.trim(request.term);
				
				var common_array = [];

				window.w2dc_collectAddressPreditions = function(predictions, common_array, response) {
					$.map(predictions, function (prediction, i) {
						common_array.push({
							label: prediction.label,
							value: prediction.value,
							name: prediction.name,
							note: w2dc_js_objects.prediction_note,
							icon: "",
							sublabel: prediction.sublabel,
							is_term: false,
						});
					})

					common_array.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );
					response(common_array);
				}

				if (term && w2dc_maps_objects.address_autocomplete && typeof w2dc_autocompleteService != 'undefined') {
					w2dc_autocompleteService(term, w2dc_maps_objects.address_autocomplete_code, common_array, response, w2dc_collectAddressPreditions);
				} else {
					response(common_array);
				}
			},
		});
		window.listing_address_autocomplete = $.widget("custom.listing_address_autocomplete", address_autocomplete, {

			_create: function() {
				this.wrapper = this.element.parent();
				
				this._createAutocomplete();
				this._addMyLocationButton();
			},
		});
	}

	$(document).on('change', '.w2dc-tax-dropdowns-wrap select', function() {
		var select_box = $(this).attr('id').split('_');
		var parent = $(this).val();
		var current_level = select_box[1];
		var uID = select_box[2];

		var divclass = $(this).parents('.w2dc-tax-dropdowns-wrap').attr('class').split(' ');
		var tax = divclass[0];
		var count = divclass[1];
		var hide_empty = divclass[2];

		w2dc_update_tax(parent, tax, current_level, count, hide_empty, uID, function() {});
	});

	function w2dc_update_tax(parent, tax, current_level, count, hide_empty, uID, callback) {
		var current_level = parseInt(current_level);
		var next_level = current_level + 1;
		var prev_level = current_level - 1;
		var selects_length = $('#w2dc-tax-dropdowns-wrap-'+uID+' .w2dc-location-chainlist').length;
		
		if (parent)
			$('#selected_tax\\['+uID+'\\]').val(parent).trigger('change');
		else if (current_level > 1)
			$('#selected_tax\\['+uID+'\\]').val($('#chainlist_'+prev_level+'_'+uID).val()).trigger('change');
		else
			$('#selected_tax\\['+uID+'\\]').val(0).trigger('change');

		var exact_terms = $('#exact_terms\\['+uID+'\\]').val();

		for (var i=next_level; i<=selects_length; i++) {
			$('#wrap_chainlist_'+i+'_'+uID).remove();
		}
		
		if (parent && typeof w2dc_js_objects['tax_dropdowns_'+uID][uID] != undefined) {
			var labels_source = w2dc_js_objects['tax_dropdowns_'+uID][uID];

			if (labels_source.labels[current_level] != undefined)
				var label = labels_source.labels[current_level];
			else
				var label = '';
			if (labels_source.titles[current_level] != undefined)
				var title = labels_source.titles[current_level];
			else
				var title = '';
			if (labels_source.allow_add_term[current_level] != undefined)
				var allow_add_term = labels_source.allow_add_term[current_level];
			else
				var allow_add_term = '';

			$('#chainlist_'+current_level+'_'+uID).addClass('w2dc-ajax-loading').attr('disabled', 'disabled');
			$.post(
				w2dc_js_objects.ajaxurl,
				{
					'action': 'w2dc_tax_dropdowns_hook',
					'parentid': parent,
					'next_level': next_level,
					'tax': tax,
					'count': count,
					'hide_empty': hide_empty,
					'label': label,
					'title': title,
					'allow_add_term': allow_add_term,
					'exact_terms': exact_terms,
					'uID': uID
				},
				function(response_from_the_action_function){
					if (response_from_the_action_function != 0)
						$('#w2dc-tax-dropdowns-wrap-'+uID).append(response_from_the_action_function);

					$('#chainlist_'+current_level+'_'+uID).removeClass('w2dc-ajax-loading').removeAttr('disabled');
					
					callback();
				}
			);
		}
	}
	
	function first(p){for(var i in p)return p[i];}
}(jQuery));



// jquery.coo_kie.js -------------------------------------------------------------------------------------------------------------------------------------------
jQuery.cookie=function(e,i,o){if("undefined"==typeof i){var n=null;if(document.cookie&&""!=document.cookie)for(var r=document.cookie.split(";"),t=0;t<r.length;t++){var p=jQuery.trim(r[t]);if(p.substring(0,e.length+1)==e+"="){n=decodeURIComponent(p.substring(e.length+1));break}}return n}o=o||{},null===i&&(i="",o.expires=-1);var u="";if(o.expires&&("number"==typeof o.expires||o.expires.toUTCString)){var s;"number"==typeof o.expires?(s=new Date,s.setTime(s.getTime()+24*o.expires*60*60*1e3)):s=o.expires,u="; expires="+s.toUTCString()}var a=o.path?"; path="+o.path:"",c=o.domain?"; domain="+o.domain:"",m=o.secure?"; secure":"";document.cookie=[e,"=",encodeURIComponent(i),u,a,c,m].join("")};



// jquery.w2dc_bxslider.min.js -------------------------------------------------------------------------------------------------------------------------------------------
/**
 * w2dc_bxslider v4.2.1d
 * Copyright 2013-2017 Steven Wanderski
 * Written while drinking Belgian ales and listening to jazz
 * Licensed under MIT (http://opensource.org/licenses/MIT)
 * 
 * 22.09.2020 - added condition in if (slider.viewport.get(0).releasePointerCapture && typeof w2dc_lightbox == "undefined") {
 */
!function(R){var Z={mode:"horizontal",slideSelector:"",infiniteLoop:!0,hideControlOnEnd:!1,speed:500,easing:null,slideMargin:0,startSlide:0,randomStart:!1,captions:!1,ticker:!1,tickerHover:!1,adaptiveHeight:!1,adaptiveHeightSpeed:500,video:!1,useCSS:!0,preloadImages:"visible",responsive:!0,slideZIndex:50,wrapperClass:"w2dc-bx-wrapper",touchEnabled:!0,swipeThreshold:50,oneToOneTouch:!0,preventDefaultSwipeX:!0,preventDefaultSwipeY:!1,ariaLive:!0,ariaHidden:!0,keyboardEnabled:!1,pager:!0,pagerType:"full",pagerShortSeparator:" / ",pagerSelector:null,buildPager:null,pagerCustom:null,controls:!0,nextText:"Next",prevText:"Prev",nextSelector:null,prevSelector:null,autoControls:!1,startText:"Start",stopText:"Stop",autoControlsCombine:!1,autoControlsSelector:null,auto:!1,pause:4e3,autoStart:!0,autoDirection:"next",stopAutoOnClick:!1,autoHover:!1,autoDelay:0,autoSlideForOnePage:!1,minSlides:1,maxSlides:1,moveSlides:0,slideWidth:0,shrinkItems:!1,onSliderLoad:function(){return!0},onSlideBefore:function(){return!0},onSlideAfter:function(){return!0},onSlideNext:function(){return!0},onSlidePrev:function(){return!0},onSliderResize:function(){return!0},onAutoChange:function(){return!0}};R.fn.w2dc_bxslider=function(e){if(0===this.length)return this;if(1<this.length)return this.each(function(){R(this).w2dc_bxslider(e)}),this;var g={},p=this,n=R(window).width(),s=R(window).height();if(!R(p).data("w2dc_bxslider")){function o(){R(p).data("w2dc_bxslider")||(g.settings=R.extend({},Z,e),g.settings.slideWidth=parseInt(g.settings.slideWidth),g.children=p.children(g.settings.slideSelector),g.children.length<g.settings.minSlides&&(g.settings.minSlides=g.children.length),g.children.length<g.settings.maxSlides&&(g.settings.maxSlides=g.children.length),g.settings.randomStart&&(g.settings.startSlide=Math.floor(Math.random()*g.children.length)),g.active={index:g.settings.startSlide},g.carousel=1<g.settings.minSlides||1<g.settings.maxSlides,g.carousel&&(g.settings.preloadImages="all"),g.minThreshold=g.settings.minSlides*g.settings.slideWidth+(g.settings.minSlides-1)*g.settings.slideMargin,g.maxThreshold=g.settings.maxSlides*g.settings.slideWidth+(g.settings.maxSlides-1)*g.settings.slideMargin,g.working=!1,g.controls={},g.interval=null,g.animProp="vertical"===g.settings.mode?"top":"left",g.usingCSS=g.settings.useCSS&&"fade"!==g.settings.mode&&function(){for(var t=document.createElement("div"),e=["WebkitPerspective","MozPerspective","OPerspective","msPerspective"],i=0;i<e.length;i++)if(void 0!==t.style[e[i]])return g.cssPrefix=e[i].replace("Perspective","").toLowerCase(),g.animProp="-"+g.cssPrefix+"-transform",!0;return!1}(),"vertical"===g.settings.mode&&(g.settings.maxSlides=g.settings.minSlides),p.data("origStyle",p.attr("style")),p.children(g.settings.slideSelector).each(function(){R(this).data("origStyle",R(this).attr("style"))}),d())}function r(){var t=1,e=null;return"horizontal"===g.settings.mode&&0<g.settings.slideWidth?t=g.viewport.width()<g.minThreshold?g.settings.minSlides:g.viewport.width()>g.maxThreshold?g.settings.maxSlides:(e=g.children.first().width()+g.settings.slideMargin,Math.floor((g.viewport.width()+g.settings.slideMargin)/e)||1):"vertical"===g.settings.mode&&(t=g.settings.minSlides),t}function t(){for(var t="",e="",i=w(),n=0;n<i;n++)e="",g.settings.buildPager&&R.isFunction(g.settings.buildPager)||g.settings.pagerCustom?(e=g.settings.buildPager(n),g.pagerEl.addClass("w2dc-bx-custom-pager")):(e=n+1,g.pagerEl.addClass("w2dc-bx-default-pager")),t+='<div class="w2dc-bx-pager-item"><a href="" data-slide-index="'+n+'" class="w2dc-bx-pager-link">'+e+"</a></div>";g.pagerEl.html(t)}function a(){p.startAuto()}function l(){p.stopAuto()}function u(t){var e=r();g.settings.ariaHidden&&!g.settings.ticker&&(g.children.attr("aria-hidden","true"),g.children.slice(t,t+e).attr("aria-hidden","false"))}var d=function(){var t=g.children.eq(g.settings.startSlide);p.wrap('<div class="'+g.settings.wrapperClass+'"><div class="w2dc-bx-viewport"></div></div>'),g.viewport=p.parent(),g.settings.ariaLive&&!g.settings.ticker&&g.viewport.attr("aria-live","polite"),g.loader=R('<div class="w2dc-bx-loading" />'),g.viewport.prepend(g.loader),p.css({width:"horizontal"===g.settings.mode?1e3*g.children.length+215+"%":"auto",position:"relative"}),g.usingCSS&&g.settings.easing?p.css("-"+g.cssPrefix+"-transition-timing-function",g.settings.easing):g.settings.easing||(g.settings.easing="swing"),g.viewport.css({width:"100%",overflow:"hidden",position:"relative"}),g.viewport.parent().css({maxWidth:f()}),g.children.css({float:"horizontal"===g.settings.mode?"left":"none",listStyle:"none",position:"relative"}),g.children.css("width",m()),"horizontal"===g.settings.mode&&0<g.settings.slideMargin&&g.children.css("marginRight",g.settings.slideMargin),"vertical"===g.settings.mode&&0<g.settings.slideMargin&&g.children.css("marginBottom",g.settings.slideMargin),"fade"===g.settings.mode&&(g.children.css({position:"absolute",zIndex:0,display:"none"}),g.children.eq(g.settings.startSlide).css({zIndex:g.settings.slideZIndex,display:"block"})),g.controls.el=R('<div class="w2dc-bx-controls" />'),g.settings.captions&&P(),g.active.last=g.settings.startSlide===w()-1,g.settings.video&&p.fitVids(),"none"===g.settings.preloadImages?t=null:"all"!==g.settings.preloadImages&&!g.settings.ticker||(t=g.children),g.settings.ticker?g.settings.pager=!1:(g.settings.controls&&T(),g.settings.auto&&g.settings.autoControls&&k(),g.settings.pager&&b(),(g.settings.controls||g.settings.autoControls||g.settings.pager)&&g.viewport.after(g.controls.el)),null===t?h():c(t,h)},c=function(t,e){var i=t.find('img:not([src=""]), iframe').length,n=0;0!==i?t.find('img:not([src=""]), iframe').each(function(){R(this).one("load error",function(){++n===i&&e()}).each(function(){!this.complete&&""!=this.src||R(this).trigger("load")})}):e()},h=function(){var t,e,i;g.settings.infiniteLoop&&"fade"!==g.settings.mode&&!g.settings.ticker&&(t="vertical"===g.settings.mode?g.settings.minSlides:g.settings.maxSlides,e=g.children.slice(0,t).clone(!0).addClass("w2dc-bx-clone"),i=g.children.slice(-t).clone(!0).addClass("w2dc-bx-clone"),g.settings.ariaHidden&&(e.attr("aria-hidden",!0),i.attr("aria-hidden",!0)),p.append(e).prepend(i)),g.loader.remove(),S(),"vertical"===g.settings.mode&&(g.settings.adaptiveHeight=!0),g.viewport.height(v()),p.redrawSlider(),g.settings.onSliderLoad.call(p,g.active.index),g.initialized=!0,g.settings.responsive&&R(window).on("resize",V),g.settings.auto&&g.settings.autoStart&&(1<w()||g.settings.autoSlideForOnePage)&&W(),g.settings.ticker&&L(),g.settings.pager&&A(g.settings.startSlide),g.settings.controls&&H(),g.settings.touchEnabled&&!g.settings.ticker&&_(),g.settings.keyboardEnabled&&!g.settings.ticker&&R(document).keydown(F)},v=function(){var e=0,t=R();if("vertical"===g.settings.mode||g.settings.adaptiveHeight)if(g.carousel){var n=1===g.settings.moveSlides?g.active.index:g.active.index*x(),t=g.children.eq(n);for(i=1;i<=g.settings.maxSlides-1;i++)t=n+i>=g.children.length?t.add(g.children.eq(i-1)):t.add(g.children.eq(n+i))}else t=g.children.eq(g.active.index);else t=g.children;return"vertical"===g.settings.mode?(t.each(function(t){e+=R(this).outerHeight()}),0<g.settings.slideMargin&&(e+=g.settings.slideMargin*(g.settings.minSlides-1))):e=Math.max.apply(Math,t.map(function(){return R(this).outerHeight(!1)}).get()),"border-box"===g.viewport.css("box-sizing")?e+=parseFloat(g.viewport.css("padding-top"))+parseFloat(g.viewport.css("padding-bottom"))+parseFloat(g.viewport.css("border-top-width"))+parseFloat(g.viewport.css("border-bottom-width")):"padding-box"===g.viewport.css("box-sizing")&&(e+=parseFloat(g.viewport.css("padding-top"))+parseFloat(g.viewport.css("padding-bottom"))),e},f=function(){var t="100%";return 0<g.settings.slideWidth&&(t="horizontal"===g.settings.mode?g.settings.maxSlides*g.settings.slideWidth+(g.settings.maxSlides-1)*g.settings.slideMargin:g.settings.slideWidth),t},m=function(){var t=g.settings.slideWidth,e=g.viewport.width();if(0===g.settings.slideWidth||g.settings.slideWidth>e&&!g.carousel||"vertical"===g.settings.mode)t=e;else if(1<g.settings.maxSlides&&"horizontal"===g.settings.mode){if(e>g.maxThreshold)return t;e<g.minThreshold?t=(e-g.settings.slideMargin*(g.settings.minSlides-1))/g.settings.minSlides:g.settings.shrinkItems&&(t=Math.floor((e+g.settings.slideMargin)/Math.ceil((e+g.settings.slideMargin)/(t+g.settings.slideMargin))-g.settings.slideMargin))}return t},w=function(){var t=0,e=0,i=0;if(0<g.settings.moveSlides){if(!g.settings.infiniteLoop){for(;e<g.children.length;)++t,e=i+r(),i+=g.settings.moveSlides<=r()?g.settings.moveSlides:r();return i}t=Math.ceil(g.children.length/x())}else t=Math.ceil(g.children.length/r());return t},x=function(){return 0<g.settings.moveSlides&&g.settings.moveSlides<=r()?g.settings.moveSlides:r()},S=function(){var t,e,i;g.children.length>g.settings.maxSlides&&g.active.last&&!g.settings.infiniteLoop?"horizontal"===g.settings.mode?(t=(e=g.children.last()).position(),C(-(t.left-(g.viewport.width()-e.outerWidth())),"reset",0)):"vertical"===g.settings.mode&&(i=g.children.length-g.settings.minSlides,t=g.children.eq(i).position(),C(-t.top,"reset",0)):(t=g.children.eq(g.active.index*x()).position(),g.active.index===w()-1&&(g.active.last=!0),void 0!==t&&("horizontal"===g.settings.mode?C(-t.left,"reset",0):"vertical"===g.settings.mode&&C(-t.top,"reset",0)))},C=function(t,e,i,n){var s,o;g.usingCSS?(o="vertical"===g.settings.mode?"translate3d(0, "+t+"px, 0)":"translate3d("+t+"px, 0, 0)",p.css("-"+g.cssPrefix+"-transition-duration",i/1e3+"s"),"slide"===e?(p.css(g.animProp,o),0!==i?p.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(t){R(t.target).is(p)&&(p.off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),q())}):q()):"reset"===e?p.css(g.animProp,o):"ticker"===e&&(p.css("-"+g.cssPrefix+"-transition-timing-function","linear"),p.css(g.animProp,o),0!==i?p.on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd",function(t){R(t.target).is(p)&&(p.off("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"),C(n.resetValue,"reset",0),O())}):(C(n.resetValue,"reset",0),O()))):((s={})[g.animProp]=t,"slide"===e?p.animate(s,i,g.settings.easing,function(){q()}):"reset"===e?p.css(g.animProp,t):"ticker"===e&&p.animate(s,i,"linear",function(){C(n.resetValue,"reset",0),O()}))},b=function(){g.settings.pagerCustom?g.pagerEl=R(g.settings.pagerCustom):(g.pagerEl=R('<div class="w2dc-bx-pager" />'),g.settings.pagerSelector?R(g.settings.pagerSelector).html(g.pagerEl):g.controls.el.addClass("w2dc-bx-has-pager").append(g.pagerEl),t()),g.pagerEl.on("click touchend","a",z)},T=function(){g.controls.next=R('<a class="w2dc-bx-next" href="">'+g.settings.nextText+"</a>"),g.controls.prev=R('<a class="w2dc-bx-prev" href="">'+g.settings.prevText+"</a>"),g.controls.next.on("click touchend",E),g.controls.prev.on("click touchend",M),g.settings.nextSelector&&R(g.settings.nextSelector).append(g.controls.next),g.settings.prevSelector&&R(g.settings.prevSelector).append(g.controls.prev),g.settings.nextSelector||g.settings.prevSelector||(g.controls.directionEl=R('<div class="w2dc-bx-controls-direction" />'),g.controls.directionEl.append(g.controls.prev).append(g.controls.next),g.controls.el.addClass("w2dc-bx-has-controls-direction").append(g.controls.directionEl))},k=function(){g.controls.start=R('<div class="w2dc-bx-controls-auto-item"><a class="w2dc-bx-start" href="">'+g.settings.startText+"</a></div>"),g.controls.stop=R('<div class="w2dc-bx-controls-auto-item"><a class="w2dc-bx-stop" href="">'+g.settings.stopText+"</a></div>"),g.controls.autoEl=R('<div class="w2dc-bx-controls-auto" />'),g.controls.autoEl.on("click",".w2dc-bx-start",y),g.controls.autoEl.on("click",".w2dc-bx-stop",I),g.settings.autoControlsCombine?g.controls.autoEl.append(g.controls.start):g.controls.autoEl.append(g.controls.start).append(g.controls.stop),g.settings.autoControlsSelector?R(g.settings.autoControlsSelector).html(g.controls.autoEl):g.controls.el.addClass("w2dc-bx-has-controls-auto").append(g.controls.autoEl),D(g.settings.autoStart?"stop":"start")},P=function(){g.children.each(function(t){var e=R(this).find("img:first").attr("title");void 0!==e&&(""+e).length&&R(this).append('<div class="w2dc-bx-caption"><span>'+e+"</span></div>")})},E=function(t){t.preventDefault(),g.controls.el.hasClass("disabled")||(g.settings.auto&&g.settings.stopAutoOnClick&&p.stopAuto(),p.goToNextSlide())},M=function(t){t.preventDefault(),g.controls.el.hasClass("disabled")||(g.settings.auto&&g.settings.stopAutoOnClick&&p.stopAuto(),p.goToPrevSlide())},y=function(t){p.startAuto(),t.preventDefault()},I=function(t){p.stopAuto(),t.preventDefault()},z=function(t){var e,i;t.preventDefault(),g.controls.el.hasClass("disabled")||(g.settings.auto&&g.settings.stopAutoOnClick&&p.stopAuto(),void 0!==(e=R(t.currentTarget)).attr("data-slide-index")&&(i=parseInt(e.attr("data-slide-index")))!==g.active.index&&p.goToSlide(i))},A=function(i){var t=g.children.length;if("short"===g.settings.pagerType)return 1<g.settings.maxSlides&&(t=Math.ceil(g.children.length/g.settings.maxSlides)),void g.pagerEl.html(i+1+g.settings.pagerShortSeparator+t);g.pagerEl.find("a").removeClass("active"),g.pagerEl.each(function(t,e){R(e).find("a").eq(i).addClass("active")})},q=function(){var t;g.settings.infiniteLoop&&(t="",0===g.active.index?t=g.children.eq(0).position():g.active.index===w()-1&&g.carousel?t=g.children.eq((w()-1)*x()).position():g.active.index===g.children.length-1&&(t=g.children.eq(g.children.length-1).position()),t&&("horizontal"===g.settings.mode?C(-t.left,"reset",0):"vertical"===g.settings.mode&&C(-t.top,"reset",0))),g.working=!1,g.settings.onSlideAfter.call(p,g.children.eq(g.active.index),g.oldIndex,g.active.index)},D=function(t){g.settings.autoControlsCombine?g.controls.autoEl.html(g.controls[t]):(g.controls.autoEl.find("a").removeClass("active"),g.controls.autoEl.find("a:not(.w2dc-bx-"+t+")").addClass("active"))},H=function(){1===w()?(g.controls.prev.addClass("disabled"),g.controls.next.addClass("disabled")):!g.settings.infiniteLoop&&g.settings.hideControlOnEnd&&(0===g.active.index?(g.controls.prev.addClass("disabled"),g.controls.next.removeClass("disabled")):g.active.index===w()-1?(g.controls.next.addClass("disabled"),g.controls.prev.removeClass("disabled")):(g.controls.prev.removeClass("disabled"),g.controls.next.removeClass("disabled")))},W=function(){0<g.settings.autoDelay?setTimeout(p.startAuto,g.settings.autoDelay):(p.startAuto(),R(window).focus(a).blur(l)),g.settings.autoHover&&p.hover(function(){g.interval&&(p.stopAuto(!0),g.autoPaused=!0)},function(){g.autoPaused&&(p.startAuto(!0),g.autoPaused=null)})},L=function(){var t,e,i,n,s,o,r,a,l=0;"next"===g.settings.autoDirection?p.append(g.children.clone().addClass("w2dc-bx-clone")):(p.prepend(g.children.clone().addClass("w2dc-bx-clone")),t=g.children.first().position(),l="horizontal"===g.settings.mode?-t.left:-t.top),C(l,"reset",0),g.settings.pager=!1,g.settings.controls=!1,g.settings.autoControls=!1,g.settings.tickerHover&&(g.usingCSS?(n="horizontal"===g.settings.mode?4:5,g.viewport.hover(function(){e=p.css("-"+g.cssPrefix+"-transform"),i=parseFloat(e.split(",")[n]),C(i,"reset",0)},function(){a=0,g.children.each(function(t){a+="horizontal"===g.settings.mode?R(this).outerWidth(!0):R(this).outerHeight(!0)}),s=g.settings.speed/a,o="horizontal"===g.settings.mode?"left":"top",r=s*(a-Math.abs(parseInt(i))),O(r)})):g.viewport.hover(function(){p.stop()},function(){a=0,g.children.each(function(t){a+="horizontal"===g.settings.mode?R(this).outerWidth(!0):R(this).outerHeight(!0)}),s=g.settings.speed/a,o="horizontal"===g.settings.mode?"left":"top",r=s*(a-Math.abs(parseInt(p.css(o)))),O(r)})),O()},O=function(t){var e,i,n=t||g.settings.speed,s={left:0,top:0},o={left:0,top:0};"next"===g.settings.autoDirection?s=p.find(".w2dc-bx-clone").first().position():o=g.children.first().position(),e="horizontal"===g.settings.mode?-s.left:-s.top,i="horizontal"===g.settings.mode?-o.left:-o.top,C(e,"ticker",n,{resetValue:i})},F=function(t){var e,i,n,s,o=document.activeElement.tagName.toLowerCase();if(null==new RegExp(o,["i"]).exec("input|textarea")&&(e=p,i=R(window),n={top:i.scrollTop(),left:i.scrollLeft()},s=e.offset(),n.right=n.left+i.width(),n.bottom=n.top+i.height(),s.right=s.left+e.outerWidth(),s.bottom=s.top+e.outerHeight(),!(n.right<s.left||n.left>s.right||n.bottom<s.top||n.top>s.bottom))){if(39===t.keyCode)return E(t),!1;if(37===t.keyCode)return M(t),!1}},_=function(){g.touch={start:{x:0,y:0},end:{x:0,y:0}},g.viewport.on("touchstart MSPointerDown pointerdown",N),g.viewport.on("click",".w2dc_bxslider a",function(t){g.viewport.hasClass("click-disabled")&&(t.preventDefault(),g.viewport.removeClass("click-disabled"))})},N=function(t){if("touchstart"===t.type||0===t.button)if(t.preventDefault(),g.controls.el.addClass("disabled"),g.working)g.controls.el.removeClass("disabled");else{g.touch.originalPos=p.position();var e=t.originalEvent,i=void 0!==e.changedTouches?e.changedTouches:[e];if("function"==typeof PointerEvent&&void 0===e.pointerId)return;g.touch.start.x=i[0].pageX,g.touch.start.y=i[0].pageY,g.viewport.get(0).setPointerCapture&&(g.pointerId=e.pointerId,g.viewport.get(0).setPointerCapture(g.pointerId)),g.originalClickTarget=e.originalTarget||e.target,g.originalClickButton=e.button,g.originalClickButtons=e.buttons,g.originalEventType=e.type,g.hasMove=!1,g.viewport.on("touchmove MSPointerMove pointermove",X),g.viewport.on("touchend MSPointerUp pointerup",Y),g.viewport.on("MSPointerCancel pointercancel",B)}},B=function(t){t.preventDefault(),C(g.touch.originalPos.left,"reset",0),g.controls.el.removeClass("disabled"),g.viewport.off("MSPointerCancel pointercancel",B),g.viewport.off("touchmove MSPointerMove pointermove",X),g.viewport.off("touchend MSPointerUp pointerup",Y),g.viewport.get(0).releasePointerCapture&&"undefined"==typeof w2dc_lightbox&&g.viewport.get(0).releasePointerCapture(g.pointerId)},X=function(t){var e=t.originalEvent,i=void 0!==e.changedTouches?e.changedTouches:[e],n=Math.abs(i[0].pageX-g.touch.start.x),s=Math.abs(i[0].pageY-g.touch.start.y),o=0,r=0;g.hasMove=!0,(s<3*n&&g.settings.preventDefaultSwipeX||n<3*s&&g.settings.preventDefaultSwipeY)&&t.preventDefault(),"touchmove"!==t.type&&t.preventDefault(),"fade"!==g.settings.mode&&g.settings.oneToOneTouch&&(o="horizontal"===g.settings.mode?(r=i[0].pageX-g.touch.start.x,g.touch.originalPos.left+r):(r=i[0].pageY-g.touch.start.y,g.touch.originalPos.top+r),C(o,"reset",0))},Y=function(t){t.preventDefault(),g.viewport.off("touchmove MSPointerMove pointermove",X),g.controls.el.removeClass("disabled");var e=t.originalEvent,i=void 0!==e.changedTouches?e.changedTouches:[e],n=0,s=0;g.touch.end.x=i[0].pageX,g.touch.end.y=i[0].pageY,"fade"===g.settings.mode?(s=Math.abs(g.touch.start.x-g.touch.end.x))>=g.settings.swipeThreshold&&(g.touch.start.x>g.touch.end.x?p.goToNextSlide():p.goToPrevSlide(),p.stopAuto()):(n="horizontal"===g.settings.mode?(s=g.touch.end.x-g.touch.start.x,g.touch.originalPos.left):(s=g.touch.end.y-g.touch.start.y,g.touch.originalPos.top),(g.settings.infiniteLoop||!(0===g.active.index&&0<s||g.active.last&&s<0))&&Math.abs(s)>=g.settings.swipeThreshold?(s<0?p.goToNextSlide():p.goToPrevSlide(),p.stopAuto()):C(n,"reset",200)),g.viewport.off("touchend MSPointerUp pointerup",Y),g.viewport.get(0).releasePointerCapture&&"undefined"==typeof w2dc_lightbox&&g.viewport.get(0).releasePointerCapture(g.pointerId),!1!==g.hasMove||0!==g.originalClickButton&&"touchstart"!==g.originalEventType||R(g.originalClickTarget).trigger({type:"click",button:g.originalClickButton,buttons:g.originalClickButtons})},V=function(t){var e,i;g.initialized&&(g.working?window.setTimeout(V,10):(e=R(window).width(),i=R(window).height(),n===e&&s===i||(n=e,s=i,p.redrawSlider(),g.settings.onSliderResize.call(p,g.active.index))))};return p.goToSlide=function(t,e){var i,n,s,o,r,a=!0,l=0,d={left:0,top:0},c=null;if(g.oldIndex=g.active.index,g.active.index=(r=t)<0?g.settings.infiniteLoop?w()-1:g.active.index:r>=w()?g.settings.infiniteLoop?0:g.active.index:r,!g.working&&g.active.index!==g.oldIndex){if(g.working=!0,void 0!==(a=g.settings.onSlideBefore.call(p,g.children.eq(g.active.index),g.oldIndex,g.active.index))&&!a)return g.active.index=g.oldIndex,void(g.working=!1);"next"===e?g.settings.onSlideNext.call(p,g.children.eq(g.active.index),g.oldIndex,g.active.index)||(a=!1):"prev"===e&&(g.settings.onSlidePrev.call(p,g.children.eq(g.active.index),g.oldIndex,g.active.index)||(a=!1)),g.active.last=g.active.index>=w()-1,(g.settings.pager||g.settings.pagerCustom)&&A(g.active.index),g.settings.controls&&H(),"fade"===g.settings.mode?(g.settings.adaptiveHeight&&g.viewport.height()!==v()&&g.viewport.animate({height:v()},g.settings.adaptiveHeightSpeed),g.children.filter(":visible").fadeOut(g.settings.speed).css({zIndex:0}),g.children.eq(g.active.index).css("zIndex",g.settings.slideZIndex+1).fadeIn(g.settings.speed,function(){R(this).css("zIndex",g.settings.slideZIndex),q()})):(g.settings.adaptiveHeight&&g.viewport.height()!==v()&&g.viewport.animate({height:v()},g.settings.adaptiveHeightSpeed),!g.settings.infiniteLoop&&g.carousel&&g.active.last?"horizontal"===g.settings.mode?(d=(c=g.children.eq(g.children.length-1)).position(),l=g.viewport.width()-c.outerWidth()):(i=g.children.length-g.settings.minSlides,d=g.children.eq(i).position()):g.carousel&&g.active.last&&"prev"===e?(n=1===g.settings.moveSlides?g.settings.maxSlides-x():(w()-1)*x()-(g.children.length-g.settings.maxSlides),d=(c=p.children(".w2dc-bx-clone").eq(n)).position()):"next"===e&&0===g.active.index?(d=p.find("> .w2dc-bx-clone").eq(g.settings.maxSlides).position(),g.active.last=!1):0<=t&&(o=t*parseInt(x()),d=g.children.eq(o).position()),void 0!==d&&(s="horizontal"===g.settings.mode?-(d.left-l):-d.top,C(s,"slide",g.settings.speed)),g.working=!1),g.settings.ariaHidden&&u(g.active.index*x())}},p.goToNextSlide=function(){var t;!g.settings.infiniteLoop&&g.active.last||!0!==g.working&&(t=parseInt(g.active.index)+1,p.goToSlide(t,"next"))},p.goToPrevSlide=function(){var t;!g.settings.infiniteLoop&&0===g.active.index||!0===g.working||(t=parseInt(g.active.index)-1,p.goToSlide(t,"prev"))},p.startAuto=function(t){g.interval||(g.interval=setInterval(function(){"next"===g.settings.autoDirection?p.goToNextSlide():p.goToPrevSlide()},g.settings.pause),g.settings.onAutoChange.call(p,!0),g.settings.autoControls&&!0!==t&&D("stop"))},p.stopAuto=function(t){g.autoPaused&&(g.autoPaused=!1),g.interval&&(clearInterval(g.interval),g.interval=null,g.settings.onAutoChange.call(p,!1),g.settings.autoControls&&!0!==t&&D("start"))},p.getCurrentSlide=function(){return g.active.index},p.getCurrentSlideElement=function(){return g.children.eq(g.active.index)},p.getSlideElement=function(t){return g.children.eq(t)},p.getSlideCount=function(){return g.children.length},p.isWorking=function(){return g.working},p.redrawSlider=function(){g.children.add(p.find(".w2dc-bx-clone")).outerWidth(m()),g.viewport.css("height",v()),g.settings.ticker||S(),g.active.last&&(g.active.index=w()-1),g.active.index>=w()&&(g.active.last=!0),g.settings.pager&&!g.settings.pagerCustom&&(t(),A(g.active.index)),g.settings.ariaHidden&&u(g.active.index*x())},p.destroySlider=function(){g.initialized&&(g.initialized=!1,R(".w2dc-bx-clone",this).remove(),g.children.each(function(){void 0!==R(this).data("origStyle")?R(this).attr("style",R(this).data("origStyle")):R(this).removeAttr("style")}),void 0!==R(this).data("origStyle")?this.attr("style",R(this).data("origStyle")):R(this).removeAttr("style"),R(this).unwrap().unwrap(),g.controls.el&&g.controls.el.remove(),g.controls.next&&g.controls.next.remove(),g.controls.prev&&g.controls.prev.remove(),g.pagerEl&&g.settings.controls&&!g.settings.pagerCustom&&g.pagerEl.remove(),R(".w2dc-bx-caption",this).remove(),g.controls.autoEl&&g.controls.autoEl.remove(),clearInterval(g.interval),g.settings.responsive&&R(window).off("resize",V),g.settings.keyboardEnabled&&R(document).off("keydown",F),R(this).removeData("w2dc_bxslider"),R(window).off("blur",l).off("focus",a))},p.reloadSlider=function(t){void 0!==t&&(e=t),p.destroySlider(),o(),R(p).data("w2dc_bxslider",this)},o(),R(p).data("w2dc_bxslider",this),this}}}(jQuery);






/* ========================================================================
 * Bootstrap: tooltip.js v3.3.5
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('w2dc_tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.5'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="w2dc-tooltip" role="tooltip"><div class="w2dc-tooltip-arrow"></div><div class="w2dc-tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('w2dc-in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('w2dc-fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass('w2dc-'+placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('w2dc-fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('w2dc-in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.w2dc-tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('w2dc-fade w2dc-in w2dc-top w2dc-bottom w2dc-left w2dc-right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('w2dc-in')

    $.support.transition && $tip.hasClass('w2dc-fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var elOffset  = isBody ? { top: 0, left: 0 } : $element.offset()
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.w2dc-tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('w2dc-in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.w2dc_tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.w2dc_tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.w2dc_tooltip

  $.fn.w2dc_tooltip             = Plugin
  $.fn.w2dc_tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.w2dc_tooltip.noConflict = function () {
    $.fn.w2dc_tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.5
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */
+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('w2dc_popover', element, options)
  }

  if (!$.fn.w2dc_tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.5'

  Popover.DEFAULTS = $.extend({}, $.fn.w2dc_tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="w2dc-popover" role="tooltip"><div class="w2dc-arrow"></div><h3 class="w2dc-popover-title"></h3><div class="w2dc-popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.w2dc_tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.w2dc-popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.w2dc-popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('w2dc-fade w2dc-top w2dc-bottom w2dc-left w2dc-right w2dc-in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.w2dc-popover-title').html()) $tip.find('.w2dc-popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }
  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.w2dc_popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.w2dc_popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.w2dc_popover

  $.fn.w2dc_popover             = Plugin
  $.fn.w2dc_popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.w2dc_popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);



// jquery.tokenize.js -------------------------------------------------------------------------------------------------------------------------------------------
!function(e){var t={BACKSPACE:8,TAB:9,ENTER:13,ESCAPE:27,ARROW_UP:38,ARROW_DOWN:40},n=null,o="tokenize",s=function(t,n){if(!n.data(o)){var s=new e.tokenize(e.extend({},e.fn.tokenize.defaults,t));n.data(o,s),s.init(n)}return n.data(o)};e.tokenize=function(t){void 0==t&&(t=e.fn.tokenize.defaults),this.options=t},e.extend(e.tokenize.prototype,{init:function(t){var n=this;this.select=t.attr("multiple","multiple").css({margin:0,padding:0,border:0}).hide(),this.container=e("<div />").attr("class",this.select.attr("class")).addClass("Tokenize"),1==this.options.maxElements&&this.container.addClass("OnlyOne"),this.dropdown=e("<ul />").addClass("Dropdown"),this.tokensContainer=e("<ul />").addClass("TokensContainer"),this.options.autosize&&this.tokensContainer.addClass("Autosize"),this.searchToken=e("<li />").addClass("TokenSearch").appendTo(this.tokensContainer),this.searchInput=e("<input />").appendTo(this.searchToken),this.options.searchMaxLength>0&&this.searchInput.attr("maxlength",this.options.searchMaxLength),this.select.prop("disabled")&&this.disable(),this.options.sortable&&("undefined"!=typeof e.ui?this.tokensContainer.sortable({items:"li.Token",cursor:"move",placeholder:"Token MovingShadow",forcePlaceholderSize:!0,update:function(){n.updateOrder()},start:function(){n.searchToken.hide()},stop:function(){n.searchToken.show()}}).disableSelection():(this.options.sortable=!1,console.log("jQuery UI is not loaded, sortable option has been disabled"))),this.container.append(this.tokensContainer).append(this.dropdown).insertAfter(this.select),this.tokensContainer.on("click",function(e){e.stopImmediatePropagation(),n.searchInput.get(0).focus(),n.updatePlaceholder(),n.dropdown.is(":hidden")&&""!=n.searchInput.val()&&n.search()}),this.searchInput.on("blur",function(){n.tokensContainer.removeClass("Focused")}),this.searchInput.on("focus click",function(){n.tokensContainer.addClass("Focused"),n.options.displayDropdownOnFocus&&"select"==n.options.datas&&n.search()}),this.searchInput.on("keydown",function(e){n.resizeSearchInput(),n.keydown(e)}),this.searchInput.on("keyup",function(e){n.keyup(e)}),this.searchInput.on("keypress",function(e){n.keypress(e)}),this.searchInput.on("paste",function(){setTimeout(function(){n.resizeSearchInput()},10),setTimeout(function(){var t=n.searchInput.val().split(",");t.length>1&&e.each(t,function(e,t){n.tokenAdd(t.trim(),"")})},20)}),e(document).on("click",function(){n.dropdownHide(),1==n.options.maxElements&&n.searchInput.val()&&n.tokenAdd(n.searchInput.val(),"")}),this.resizeSearchInput(),this.remap(!0),this.updatePlaceholder()},updateOrder:function(){if(this.options.sortable){var t,n,o=this;e.each(this.tokensContainer.sortable("toArray",{attribute:"data-value"}),function(s,i){n=e('option[value="'+i+'"]',o.select),void 0==t?n.prependTo(o.select):t.after(n),t=n}),this.options.onReorder(this)}},updatePlaceholder:function(){0!=this.options.placeholder&&(void 0==this.placeholder&&(this.placeholder=e("<li />").addClass("Placeholder").html(this.options.placeholder),this.placeholder.insertBefore(e("li:first-child",this.tokensContainer))),0==this.searchInput.val().length&&0==e("li.Token",this.tokensContainer).length?this.placeholder.show():this.placeholder.hide())},dropdownShow:function(){this.dropdown.show()},dropdownPrev:function(){e("li.Hover",this.dropdown).length>0?e("li.Hover",this.dropdown).is("li:first-child")?(e("li.Hover",this.dropdown).removeClass("Hover"),e("li:last-child",this.dropdown).addClass("Hover")):e("li.Hover",this.dropdown).removeClass("Hover").prev().addClass("Hover"):e("li:first",this.dropdown).addClass("Hover")},dropdownNext:function(){e("li.Hover",this.dropdown).length>0?e("li.Hover",this.dropdown).is("li:last-child")?(e("li.Hover",this.dropdown).removeClass("Hover"),e("li:first-child",this.dropdown).addClass("Hover")):e("li.Hover",this.dropdown).removeClass("Hover").next().addClass("Hover"):e("li:first",this.dropdown).addClass("Hover")},dropdownAddItem:function(t,n,o){if(void 0==o&&(o=n),!e('li[data-value="'+t+'"]',this.tokensContainer).length){var s=this,i=e("<li />").attr("data-value",t).attr("data-text",n).html(o).on("click",function(t){t.stopImmediatePropagation(),s.tokenAdd(e(this).attr("data-value"),e(this).attr("data-text"))}).on("mouseover",function(){e(this).addClass("Hover")}).on("mouseout",function(){e("li",s.dropdown).removeClass("Hover")});this.dropdown.append(i),this.options.onDropdownAddItem(t,n,o,this)}return this},dropdownHide:function(){this.dropdownReset(),this.dropdown.hide()},dropdownReset:function(){this.dropdown.html("")},resizeSearchInput:function(){this.searchInput.attr("size",Number(this.searchInput.val().length)+5),this.updatePlaceholder()},resetSearchInput:function(){this.searchInput.val(""),this.resizeSearchInput()},resetPendingTokens:function(){e("li.PendingDelete",this.tokensContainer).removeClass("PendingDelete")},keypress:function(e){String.fromCharCode(e.which)==this.options.delimiter&&(e.preventDefault(),this.tokenAdd(this.searchInput.val(),""))},keydown:function(n){switch(n.keyCode){case t.BACKSPACE:0==this.searchInput.val().length&&(n.preventDefault(),e("li.Token.PendingDelete",this.tokensContainer).length?this.tokenRemove(e("li.Token.PendingDelete").attr("data-value")):e("li.Token:last",this.tokensContainer).addClass("PendingDelete"),this.dropdownHide());break;case t.TAB:case t.ENTER:if(e("li.Hover",this.dropdown).length){var o=e("li.Hover",this.dropdown);n.preventDefault(),this.tokenAdd(o.attr("data-value"),o.attr("data-text"))}else this.searchInput.val()&&(n.preventDefault(),this.tokenAdd(this.searchInput.val(),""));this.resetPendingTokens();break;case t.ESCAPE:this.resetSearchInput(),this.dropdownHide(),this.resetPendingTokens();break;case t.ARROW_UP:n.preventDefault(),this.dropdownPrev();break;case t.ARROW_DOWN:n.preventDefault(),this.dropdownNext();break;default:this.resetPendingTokens()}},keyup:function(e){switch(this.updatePlaceholder(),e.keyCode){case t.TAB:case t.ENTER:case t.ESCAPE:case t.ARROW_UP:case t.ARROW_DOWN:break;case t.BACKSPACE:this.searchInput.val()?this.search():this.dropdownHide();break;default:this.searchInput.val()&&this.search()}},search:function(){var t=this,n=1;if(this.options.maxElements>0&&e("li.Token",this.tokensContainer).length>=this.options.maxElements)return!1;if("select"==this.options.datas){var o=!1,s=new RegExp(this.searchInput.val().replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"),"i");this.dropdownReset(),e("option",this.select).not(":selected, :disabled").each(function(){return n<=t.options.nbDropdownElements?void(s.test(e(this).html())&&(t.dropdownAddItem(e(this).attr("value"),e(this).html()),o=!0,n++)):!1}),o?(e("li:first",this.dropdown).addClass("Hover"),this.dropdownShow()):this.dropdownHide()}else this.debounce(function(){e.ajax({url:t.options.datas,data:t.options.searchParam+"="+t.searchInput.val(),dataType:t.options.dataType,success:function(o){return o&&(t.dropdownReset(),e.each(o,function(e,o){if(!(n<=t.options.nbDropdownElements))return!1;var s=void 0;o[t.options.htmlField]&&(s=o[t.options.htmlField]),t.dropdownAddItem(o[t.options.valueField],o[t.options.textField],s),n++}),e("li",t.dropdown).length)?(e("li:first",t.dropdown).addClass("Hover"),t.dropdownShow(),!0):void t.dropdownHide()},error:function(e,t){console.log("Error : "+t)}})},this.options.debounce)},debounce:function(e,t){var o=this,s=arguments,i=function(){e.apply(o,s),n=null};n&&clearTimeout(n),n=setTimeout(i,t||this.options.debounce)},tokenAdd:function(t,n,o){if(t=this.escape(t),void 0==t||""==t)return this;if((void 0==n||""==n)&&(n=t),void 0==o&&(o=!1),this.options.maxElements>0&&e("li.Token",this.tokensContainer).length>=this.options.maxElements)return this.resetSearchInput(),this;var s=this,i=e("<a />").addClass("Close").html("&#215;").on("click",function(e){e.stopImmediatePropagation(),s.tokenRemove(t)});if(e('option[value="'+t+'"]',this.select).length)e('option[value="'+t+'"]',this.select).attr("selected",!0).prop("selected",!0);else{if(!(this.options.newElements||!this.options.newElements&&e('li[data-value="'+t+'"]',this.dropdown).length>0))return this.resetSearchInput(),this;var a=e("<option />").attr("selected",!0).attr("value",t).attr("data-type","custom").prop("selected",!0).html(n);this.select.append(a)}return e('li.Token[data-value="'+t+'"]',this.tokensContainer).length>0?this:(e("<li />").addClass("Token").attr("data-value",t).append("<span>"+n+"</span>").prepend(i).insertBefore(this.searchToken),o||this.options.onAddToken(t,n,this),this.resetSearchInput(),this.dropdownHide(),this.updateOrder(),this)},tokenRemove:function(t){var n=e('option[value="'+t+'"]',this.select);return"custom"==n.attr("data-type")?n.remove():n.removeAttr("selected").prop("selected",!1),e('li.Token[data-value="'+t+'"]',this.tokensContainer).remove(),this.options.onRemoveToken(t,this),this.resizeSearchInput(),this.dropdownHide(),this.updateOrder(),this},clear:function(){var t=this;return e("li.Token",this.tokensContainer).each(function(){t.tokenRemove(e(this).attr("data-value"))}),this.options.onClear(this),this.dropdownHide(),this},disable:function(){return this.select.prop("disabled",!0),this.searchInput.prop("disabled",!0),this.container.addClass("Disabled"),this.options.sortable&&this.tokensContainer.sortable("disable"),this},enable:function(){return this.select.prop("disabled",!1),this.searchInput.prop("disabled",!1),this.container.removeClass("Disabled"),this.options.sortable&&this.tokensContainer.sortable("enable"),this},remap:function(t){var n=this,o=e("option:selected",this.select);return void 0==t&&(t=!1),this.clear(),o.each(function(){n.tokenAdd(e(this).val(),e(this).html(),t)}),this},toArray:function(){var t=[];return e("option:selected",this.select).each(function(){t.push(e(this).val())}),t},escape:function(e){return String(e).replace(/["]/g,function(){return""})}}),e.fn.tokenize=function(t){void 0==t&&(t={});var n=this.filter("select");return n.length>1?(n.each(function(){s(t,e(this))}),n):s(t,e(this))},e.fn.tokenize.defaults={datas:"select",placeholder:!1,searchParam:"search",searchMaxLength:0,debounce:0,delimiter:",",newElements:!0,autosize:!1,nbDropdownElements:10,displayDropdownOnFocus:!1,maxElements:0,sortable:!1,dataType:"json",valueField:"value",textField:"text",htmlField:"html",onAddToken:function(){},onRemoveToken:function(){},onClear:function(){},onReorder:function(){},onDropdownAddItem:function(){}}}(jQuery,"tokenize");


/* jquery.nicescroll v3.7.6 InuYaksa - MIT - https://nicescroll.areaaperta.com */
!function(e){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof exports?module.exports=e(require("jquery")):e(jQuery)}(function(e){"use strict";var o=!1,t=!1,r=0,i=2e3,s=0,n=e,l=document,a=window,c=n(a),d=[],u=a.requestAnimationFrame||a.webkitRequestAnimationFrame||a.mozRequestAnimationFrame||!1,h=a.cancelAnimationFrame||a.webkitCancelAnimationFrame||a.mozCancelAnimationFrame||!1;if(u)a.cancelAnimationFrame||(h=function(e){});else{var p=0;u=function(e,o){var t=(new Date).getTime(),r=Math.max(0,16-(t-p)),i=a.setTimeout(function(){e(t+r)},r);return p=t+r,i},h=function(e){a.clearTimeout(e)}}var m=a.MutationObserver||a.WebKitMutationObserver||!1,f=Date.now||function(){return(new Date).getTime()},g={zindex:"auto",cursoropacitymin:0,cursoropacitymax:1,cursorcolor:"#424242",cursorwidth:"6px",cursorborder:"1px solid #fff",cursorborderradius:"5px",scrollspeed:40,mousescrollstep:27,touchbehavior:!1,emulatetouch:!1,hwacceleration:!0,usetransition:!0,boxzoom:!1,dblclickzoom:!0,gesturezoom:!0,grabcursorenabled:!0,autohidemode:!0,background:"",iframeautoresize:!0,cursorminheight:32,preservenativescrolling:!0,railoffset:!1,railhoffset:!1,bouncescroll:!0,spacebarenabled:!0,railpadding:{top:0,right:0,left:0,bottom:0},disableoutline:!0,horizrailenabled:!0,railalign:"right",railvalign:"bottom",enabletranslate3d:!0,enablemousewheel:!0,enablekeyboard:!0,smoothscroll:!0,sensitiverail:!0,enablemouselockapi:!0,cursorfixedheight:!1,directionlockdeadzone:6,hidecursordelay:400,nativeparentscrolling:!0,enablescrollonselection:!0,overflowx:!0,overflowy:!0,cursordragspeed:.3,rtlmode:"auto",cursordragontouch:!1,oneaxismousemode:"auto",scriptpath:function(){var e=l.currentScript||function(){var e=l.getElementsByTagName("script");return!!e.length&&e[e.length-1]}(),o=e?e.src.split("?")[0]:"";return o.split("/").length>0?o.split("/").slice(0,-1).join("/")+"/":""}(),preventmultitouchscrolling:!0,disablemutationobserver:!1,enableobserver:!0,scrollbarid:!1},v=!1,w=function(){if(v)return v;var e=l.createElement("DIV"),o=e.style,t=navigator.userAgent,r=navigator.platform,i={};return i.haspointerlock="pointerLockElement"in l||"webkitPointerLockElement"in l||"mozPointerLockElement"in l,i.isopera="opera"in a,i.isopera12=i.isopera&&"getUserMedia"in navigator,i.isoperamini="[object OperaMini]"===Object.prototype.toString.call(a.operamini),i.isie="all"in l&&"attachEvent"in e&&!i.isopera,i.isieold=i.isie&&!("msInterpolationMode"in o),i.isie7=i.isie&&!i.isieold&&(!("documentMode"in l)||7===l.documentMode),i.isie8=i.isie&&"documentMode"in l&&8===l.documentMode,i.isie9=i.isie&&"performance"in a&&9===l.documentMode,i.isie10=i.isie&&"performance"in a&&10===l.documentMode,i.isie11="msRequestFullscreen"in e&&l.documentMode>=11,i.ismsedge="msCredentials"in a,i.ismozilla="MozAppearance"in o,i.iswebkit=!i.ismsedge&&"WebkitAppearance"in o,i.ischrome=i.iswebkit&&"chrome"in a,i.ischrome38=i.ischrome&&"touchAction"in o,i.ischrome22=!i.ischrome38&&i.ischrome&&i.haspointerlock,i.ischrome26=!i.ischrome38&&i.ischrome&&"transition"in o,i.cantouch="ontouchstart"in l.documentElement||"ontouchstart"in a,i.hasw3ctouch=(a.PointerEvent||!1)&&(navigator.maxTouchPoints>0||navigator.msMaxTouchPoints>0),i.hasmstouch=!i.hasw3ctouch&&(a.MSPointerEvent||!1),i.ismac=/^mac$/i.test(r),i.isios=i.cantouch&&/iphone|ipad|ipod/i.test(r),i.isios4=i.isios&&!("seal"in Object),i.isios7=i.isios&&"webkitHidden"in l,i.isios8=i.isios&&"hidden"in l,i.isios10=i.isios&&a.Proxy,i.isandroid=/android/i.test(t),i.haseventlistener="addEventListener"in e,i.trstyle=!1,i.hastransform=!1,i.hastranslate3d=!1,i.transitionstyle=!1,i.hastransition=!1,i.transitionend=!1,i.trstyle="transform",i.hastransform="transform"in o||function(){for(var e=["msTransform","webkitTransform","MozTransform","OTransform"],t=0,r=e.length;t<r;t++)if(void 0!==o[e[t]]){i.trstyle=e[t];break}i.hastransform=!!i.trstyle}(),i.hastransform&&(o[i.trstyle]="translate3d(1px,2px,3px)",i.hastranslate3d=/translate3d/.test(o[i.trstyle])),i.transitionstyle="transition",i.prefixstyle="",i.transitionend="transitionend",i.hastransition="transition"in o||function(){i.transitionend=!1;for(var e=["webkitTransition","msTransition","MozTransition","OTransition","OTransition","KhtmlTransition"],t=["-webkit-","-ms-","-moz-","-o-","-o","-khtml-"],r=["webkitTransitionEnd","msTransitionEnd","transitionend","otransitionend","oTransitionEnd","KhtmlTransitionEnd"],s=0,n=e.length;s<n;s++)if(e[s]in o){i.transitionstyle=e[s],i.prefixstyle=t[s],i.transitionend=r[s];break}i.ischrome26&&(i.prefixstyle=t[1]),i.hastransition=i.transitionstyle}(),i.cursorgrabvalue=function(){var e=["grab","-webkit-grab","-moz-grab"];(i.ischrome&&!i.ischrome38||i.isie)&&(e=[]);for(var t=0,r=e.length;t<r;t++){var s=e[t];if(o.cursor=s,o.cursor==s)return s}return"url(https://cdnjs.cloudflare.com/ajax/libs/slider-pro/1.3.0/css/images/openhand.cur),n-resize"}(),i.hasmousecapture="setCapture"in e,i.hasMutationObserver=!1!==m,e=null,v=i,i},b=function(e,p){function v(){var e=T.doc.css(P.trstyle);return!(!e||"matrix"!=e.substr(0,6))&&e.replace(/^.*\((.*)\)$/g,"$1").replace(/px/g,"").split(/, +/)}function b(){var e=T.win;if("zIndex"in e)return e.zIndex();for(;e.length>0;){if(9==e[0].nodeType)return!1;var o=e.css("zIndex");if(!isNaN(o)&&0!==o)return parseInt(o);e=e.parent()}return!1}function x(e,o,t){var r=e.css(o),i=parseFloat(r);if(isNaN(i)){var s=3==(i=I[r]||0)?t?T.win.outerHeight()-T.win.innerHeight():T.win.outerWidth()-T.win.innerWidth():1;return T.isie8&&i&&(i+=1),s?i:0}return i}function S(e,o,t,r){T._bind(e,o,function(r){var i={original:r=r||a.event,target:r.target||r.srcElement,type:"wheel",deltaMode:"MozMousePixelScroll"==r.type?0:1,deltaX:0,deltaZ:0,preventDefault:function(){return r.preventDefault?r.preventDefault():r.returnValue=!1,!1},stopImmediatePropagation:function(){r.stopImmediatePropagation?r.stopImmediatePropagation():r.cancelBubble=!0}};return"mousewheel"==o?(r.wheelDeltaX&&(i.deltaX=-.025*r.wheelDeltaX),r.wheelDeltaY&&(i.deltaY=-.025*r.wheelDeltaY),!i.deltaY&&!i.deltaX&&(i.deltaY=-.025*r.wheelDelta)):i.deltaY=r.detail,t.call(e,i)},r)}function z(e,o,t,r){T.scrollrunning||(T.newscrolly=T.getScrollTop(),T.newscrollx=T.getScrollLeft(),D=f());var i=f()-D;if(D=f(),i>350?A=1:A+=(2-A)/10,e=e*A|0,o=o*A|0,e){if(r)if(e<0){if(T.getScrollLeft()>=T.page.maxw)return!0}else if(T.getScrollLeft()<=0)return!0;var s=e>0?1:-1;X!==s&&(T.scrollmom&&T.scrollmom.stop(),T.newscrollx=T.getScrollLeft(),X=s),T.lastdeltax-=e}if(o){if(function(){var e=T.getScrollTop();if(o<0){if(e>=T.page.maxh)return!0}else if(e<=0)return!0}()){if(M.nativeparentscrolling&&t&&!T.ispage&&!T.zoomactive)return!0;var n=T.view.h>>1;T.newscrolly<-n?(T.newscrolly=-n,o=-1):T.newscrolly>T.page.maxh+n?(T.newscrolly=T.page.maxh+n,o=1):o=0}var l=o>0?1:-1;B!==l&&(T.scrollmom&&T.scrollmom.stop(),T.newscrolly=T.getScrollTop(),B=l),T.lastdeltay-=o}(o||e)&&T.synched("relativexy",function(){var e=T.lastdeltay+T.newscrolly;T.lastdeltay=0;var o=T.lastdeltax+T.newscrollx;T.lastdeltax=0,T.rail.drag||T.doScrollPos(o,e)})}function k(e,o,t){var r,i;return!(t||!q)||(0===e.deltaMode?(r=-e.deltaX*(M.mousescrollstep/54)|0,i=-e.deltaY*(M.mousescrollstep/54)|0):1===e.deltaMode&&(r=-e.deltaX*M.mousescrollstep*50/80|0,i=-e.deltaY*M.mousescrollstep*50/80|0),o&&M.oneaxismousemode&&0===r&&i&&(r=i,i=0,t&&(r<0?T.getScrollLeft()>=T.page.maxw:T.getScrollLeft()<=0)&&(i=r,r=0)),T.isrtlmode&&(r=-r),z(r,i,t,!0)?void(t&&(q=!0)):(q=!1,e.stopImmediatePropagation(),e.preventDefault()))}var T=this;this.version="3.7.6",this.name="nicescroll",this.me=p;var E=n("body"),M=this.opt={doc:E,win:!1};if(n.extend(M,g),M.snapbackspeed=80,e)for(var L in M)void 0!==e[L]&&(M[L]=e[L]);if(M.disablemutationobserver&&(m=!1),this.doc=M.doc,this.iddoc=this.doc&&this.doc[0]?this.doc[0].id||"":"",this.ispage=/^BODY|HTML/.test(M.win?M.win[0].nodeName:this.doc[0].nodeName),this.haswrapper=!1!==M.win,this.win=M.win||(this.ispage?c:this.doc),this.docscroll=this.ispage&&!this.haswrapper?c:this.win,this.body=E,this.viewport=!1,this.isfixed=!1,this.iframe=!1,this.isiframe="IFRAME"==this.doc[0].nodeName&&"IFRAME"==this.win[0].nodeName,this.istextarea="TEXTAREA"==this.win[0].nodeName,this.forcescreen=!1,this.canshowonmouseevent="scroll"!=M.autohidemode,this.onmousedown=!1,this.onmouseup=!1,this.onmousemove=!1,this.onmousewheel=!1,this.onkeypress=!1,this.ongesturezoom=!1,this.onclick=!1,this.onscrollstart=!1,this.onscrollend=!1,this.onscrollcancel=!1,this.onzoomin=!1,this.onzoomout=!1,this.view=!1,this.page=!1,this.scroll={x:0,y:0},this.scrollratio={x:0,y:0},this.cursorheight=20,this.scrollvaluemax=0,"auto"==M.rtlmode){var C=this.win[0]==a?this.body:this.win,N=C.css("writing-mode")||C.css("-webkit-writing-mode")||C.css("-ms-writing-mode")||C.css("-moz-writing-mode");"horizontal-tb"==N||"lr-tb"==N||""===N?(this.isrtlmode="rtl"==C.css("direction"),this.isvertical=!1):(this.isrtlmode="vertical-rl"==N||"tb"==N||"tb-rl"==N||"rl-tb"==N,this.isvertical="vertical-rl"==N||"tb"==N||"tb-rl"==N)}else this.isrtlmode=!0===M.rtlmode,this.isvertical=!1;if(this.scrollrunning=!1,this.scrollmom=!1,this.observer=!1,this.observerremover=!1,this.observerbody=!1,!1!==M.scrollbarid)this.id=M.scrollbarid;else do{this.id="ascrail"+i++}while(l.getElementById(this.id));this.rail=!1,this.cursor=!1,this.cursorfreezed=!1,this.selectiondrag=!1,this.zoom=!1,this.zoomactive=!1,this.hasfocus=!1,this.hasmousefocus=!1,this.railslocked=!1,this.locked=!1,this.hidden=!1,this.cursoractive=!0,this.wheelprevented=!1,this.overflowx=M.overflowx,this.overflowy=M.overflowy,this.nativescrollingarea=!1,this.checkarea=0,this.events=[],this.saved={},this.delaylist={},this.synclist={},this.lastdeltax=0,this.lastdeltay=0,this.detected=w();var P=n.extend({},this.detected);this.canhwscroll=P.hastransform&&M.hwacceleration,this.ishwscroll=this.canhwscroll&&T.haswrapper,this.isrtlmode?this.isvertical?this.hasreversehr=!(P.iswebkit||P.isie||P.isie11):this.hasreversehr=!(P.iswebkit||P.isie&&!P.isie10&&!P.isie11):this.hasreversehr=!1,this.istouchcapable=!1,P.cantouch||!P.hasw3ctouch&&!P.hasmstouch?!P.cantouch||P.isios||P.isandroid||!P.iswebkit&&!P.ismozilla||(this.istouchcapable=!0):this.istouchcapable=!0,M.enablemouselockapi||(P.hasmousecapture=!1,P.haspointerlock=!1),this.debounced=function(e,o,t){T&&(T.delaylist[e]||!1||(T.delaylist[e]={h:u(function(){T.delaylist[e].fn.call(T),T.delaylist[e]=!1},t)},o.call(T)),T.delaylist[e].fn=o)},this.synched=function(e,o){T.synclist[e]?T.synclist[e]=o:(T.synclist[e]=o,u(function(){T&&(T.synclist[e]&&T.synclist[e].call(T),T.synclist[e]=null)}))},this.unsynched=function(e){T.synclist[e]&&(T.synclist[e]=!1)},this.css=function(e,o){for(var t in o)T.saved.css.push([e,t,e.css(t)]),e.css(t,o[t])},this.scrollTop=function(e){return void 0===e?T.getScrollTop():T.setScrollTop(e)},this.scrollLeft=function(e){return void 0===e?T.getScrollLeft():T.setScrollLeft(e)};var R=function(e,o,t,r,i,s,n){this.st=e,this.ed=o,this.spd=t,this.p1=r||0,this.p2=i||1,this.p3=s||0,this.p4=n||1,this.ts=f(),this.df=o-e};if(R.prototype={B2:function(e){return 3*(1-e)*(1-e)*e},B3:function(e){return 3*(1-e)*e*e},B4:function(e){return e*e*e},getPos:function(){return(f()-this.ts)/this.spd},getNow:function(){var e=(f()-this.ts)/this.spd,o=this.B2(e)+this.B3(e)+this.B4(e);return e>=1?this.ed:this.st+this.df*o|0},update:function(e,o){return this.st=this.getNow(),this.ed=e,this.spd=o,this.ts=f(),this.df=this.ed-this.st,this}},this.ishwscroll){this.doc.translate={x:0,y:0,tx:"0px",ty:"0px"},P.hastranslate3d&&P.isios&&this.doc.css("-webkit-backface-visibility","hidden"),this.getScrollTop=function(e){if(!e){var o=v();if(o)return 16==o.length?-o[13]:-o[5];if(T.timerscroll&&T.timerscroll.bz)return T.timerscroll.bz.getNow()}return T.doc.translate.y},this.getScrollLeft=function(e){if(!e){var o=v();if(o)return 16==o.length?-o[12]:-o[4];if(T.timerscroll&&T.timerscroll.bh)return T.timerscroll.bh.getNow()}return T.doc.translate.x},this.notifyScrollEvent=function(e){var o=l.createEvent("UIEvents");o.initUIEvent("scroll",!1,!1,a,1),o.niceevent=!0,e.dispatchEvent(o)};var _=this.isrtlmode?1:-1;P.hastranslate3d&&M.enabletranslate3d?(this.setScrollTop=function(e,o){T.doc.translate.y=e,T.doc.translate.ty=-1*e+"px",T.doc.css(P.trstyle,"translate3d("+T.doc.translate.tx+","+T.doc.translate.ty+",0)"),o||T.notifyScrollEvent(T.win[0])},this.setScrollLeft=function(e,o){T.doc.translate.x=e,T.doc.translate.tx=e*_+"px",T.doc.css(P.trstyle,"translate3d("+T.doc.translate.tx+","+T.doc.translate.ty+",0)"),o||T.notifyScrollEvent(T.win[0])}):(this.setScrollTop=function(e,o){T.doc.translate.y=e,T.doc.translate.ty=-1*e+"px",T.doc.css(P.trstyle,"translate("+T.doc.translate.tx+","+T.doc.translate.ty+")"),o||T.notifyScrollEvent(T.win[0])},this.setScrollLeft=function(e,o){T.doc.translate.x=e,T.doc.translate.tx=e*_+"px",T.doc.css(P.trstyle,"translate("+T.doc.translate.tx+","+T.doc.translate.ty+")"),o||T.notifyScrollEvent(T.win[0])})}else this.getScrollTop=function(){return T.docscroll.scrollTop()},this.setScrollTop=function(e){T.docscroll.scrollTop(e)},this.getScrollLeft=function(){return T.hasreversehr?T.detected.ismozilla?T.page.maxw-Math.abs(T.docscroll.scrollLeft()):T.page.maxw-T.docscroll.scrollLeft():T.docscroll.scrollLeft()},this.setScrollLeft=function(e){return setTimeout(function(){if(T)return T.hasreversehr&&(e=T.detected.ismozilla?-(T.page.maxw-e):T.page.maxw-e),T.docscroll.scrollLeft(e)},1)};this.getTarget=function(e){return!!e&&(e.target?e.target:!!e.srcElement&&e.srcElement)},this.hasParent=function(e,o){if(!e)return!1;for(var t=e.target||e.srcElement||e||!1;t&&t.id!=o;)t=t.parentNode||!1;return!1!==t};var I={thin:1,medium:3,thick:5};this.getDocumentScrollOffset=function(){return{top:a.pageYOffset||l.documentElement.scrollTop,left:a.pageXOffset||l.documentElement.scrollLeft}},this.getOffset=function(){if(T.isfixed){var e=T.win.offset(),o=T.getDocumentScrollOffset();return e.top-=o.top,e.left-=o.left,e}var t=T.win.offset();if(!T.viewport)return t;var r=T.viewport.offset();return{top:t.top-r.top,left:t.left-r.left}},this.updateScrollBar=function(e){var o,t;if(T.ishwscroll)T.rail.css({height:T.win.innerHeight()-(M.railpadding.top+M.railpadding.bottom)}),T.railh&&T.railh.css({width:T.win.innerWidth()-(M.railpadding.left+M.railpadding.right)});else{var r=T.getOffset();if(o={top:r.top,left:r.left-(M.railpadding.left+M.railpadding.right)},o.top+=x(T.win,"border-top-width",!0),o.left+=T.rail.align?T.win.outerWidth()-x(T.win,"border-right-width")-T.rail.width:x(T.win,"border-left-width"),(t=M.railoffset)&&(t.top&&(o.top+=t.top),t.left&&(o.left+=t.left)),T.railslocked||T.rail.css({top:o.top,left:o.left,height:(e?e.h:T.win.innerHeight())-(M.railpadding.top+M.railpadding.bottom)}),T.zoom&&T.zoom.css({top:o.top+1,left:1==T.rail.align?o.left-20:o.left+T.rail.width+4}),T.railh&&!T.railslocked){o={top:r.top,left:r.left},(t=M.railhoffset)&&(t.top&&(o.top+=t.top),t.left&&(o.left+=t.left));var i=T.railh.align?o.top+x(T.win,"border-top-width",!0)+T.win.innerHeight()-T.railh.height:o.top+x(T.win,"border-top-width",!0),s=o.left+x(T.win,"border-left-width");T.railh.css({top:i-(M.railpadding.top+M.railpadding.bottom),left:s,width:T.railh.width})}}},this.doRailClick=function(e,o,t){var r,i,s,n;T.railslocked||(T.cancelEvent(e),"pageY"in e||(e.pageX=e.clientX+l.documentElement.scrollLeft,e.pageY=e.clientY+l.documentElement.scrollTop),o?(r=t?T.doScrollLeft:T.doScrollTop,s=t?(e.pageX-T.railh.offset().left-T.cursorwidth/2)*T.scrollratio.x:(e.pageY-T.rail.offset().top-T.cursorheight/2)*T.scrollratio.y,T.unsynched("relativexy"),r(0|s)):(r=t?T.doScrollLeftBy:T.doScrollBy,s=t?T.scroll.x:T.scroll.y,n=t?e.pageX-T.railh.offset().left:e.pageY-T.rail.offset().top,i=t?T.view.w:T.view.h,r(s>=n?i:-i)))},T.newscrolly=T.newscrollx=0,T.hasanimationframe="requestAnimationFrame"in a,T.hascancelanimationframe="cancelAnimationFrame"in a,T.hasborderbox=!1,this.init=function(){if(T.saved.css=[],P.isoperamini)return!0;if(P.isandroid&&!("hidden"in l))return!0;M.emulatetouch=M.emulatetouch||M.touchbehavior,T.hasborderbox=a.getComputedStyle&&"border-box"===a.getComputedStyle(l.body)["box-sizing"];var e={"overflow-y":"hidden"};if((P.isie11||P.isie10)&&(e["-ms-overflow-style"]="none"),T.ishwscroll&&(this.doc.css(P.transitionstyle,P.prefixstyle+"transform 0ms ease-out"),P.transitionend&&T.bind(T.doc,P.transitionend,T.onScrollTransitionEnd,!1)),T.zindex="auto",T.ispage||"auto"!=M.zindex?T.zindex=M.zindex:T.zindex=b()||"auto",!T.ispage&&"auto"!=T.zindex&&T.zindex>s&&(s=T.zindex),T.isie&&0===T.zindex&&"auto"==M.zindex&&(T.zindex="auto"),!T.ispage||!P.isieold){var i=T.docscroll;T.ispage&&(i=T.haswrapper?T.win:T.doc),T.css(i,e),T.ispage&&(P.isie11||P.isie)&&T.css(n("html"),e),!P.isios||T.ispage||T.haswrapper||T.css(E,{"-webkit-overflow-scrolling":"touch"});var d=n(l.createElement("div"));d.css({position:"relative",top:0,float:"right",width:M.cursorwidth,height:0,"background-color":M.cursorcolor,border:M.cursorborder,"background-clip":"padding-box","-webkit-border-radius":M.cursorborderradius,"-moz-border-radius":M.cursorborderradius,"border-radius":M.cursorborderradius}),d.addClass("nicescroll-cursors"),T.cursor=d;var u=n(l.createElement("div"));u.attr("id",T.id),u.addClass("nicescroll-rails nicescroll-rails-vr");var h,p,f=["left","right","top","bottom"];for(var g in f)p=f[g],(h=M.railpadding[p]||0)&&u.css("padding-"+p,h+"px");u.append(d),u.width=Math.max(parseFloat(M.cursorwidth),d.outerWidth()),u.css({width:u.width+"px",zIndex:T.zindex,background:M.background,cursor:"default"}),u.visibility=!0,u.scrollable=!0,u.align="left"==M.railalign?0:1,T.rail=u,T.rail.drag=!1;var v=!1;!M.boxzoom||T.ispage||P.isieold||(v=l.createElement("div"),T.bind(v,"click",T.doZoom),T.bind(v,"mouseenter",function(){T.zoom.css("opacity",M.cursoropacitymax)}),T.bind(v,"mouseleave",function(){T.zoom.css("opacity",M.cursoropacitymin)}),T.zoom=n(v),T.zoom.css({cursor:"pointer",zIndex:T.zindex,backgroundImage:"url("+M.scriptpath+"zoomico.png)",height:18,width:18,backgroundPosition:"0 0"}),M.dblclickzoom&&T.bind(T.win,"dblclick",T.doZoom),P.cantouch&&M.gesturezoom&&(T.ongesturezoom=function(e){return e.scale>1.5&&T.doZoomIn(e),e.scale<.8&&T.doZoomOut(e),T.cancelEvent(e)},T.bind(T.win,"gestureend",T.ongesturezoom))),T.railh=!1;var w;if(M.horizrailenabled&&(T.css(i,{overflowX:"hidden"}),(d=n(l.createElement("div"))).css({position:"absolute",top:0,height:M.cursorwidth,width:0,backgroundColor:M.cursorcolor,border:M.cursorborder,backgroundClip:"padding-box","-webkit-border-radius":M.cursorborderradius,"-moz-border-radius":M.cursorborderradius,"border-radius":M.cursorborderradius}),P.isieold&&d.css("overflow","hidden"),d.addClass("nicescroll-cursors"),T.cursorh=d,(w=n(l.createElement("div"))).attr("id",T.id+"-hr"),w.addClass("nicescroll-rails nicescroll-rails-hr"),w.height=Math.max(parseFloat(M.cursorwidth),d.outerHeight()),w.css({height:w.height+"px",zIndex:T.zindex,background:M.background}),w.append(d),w.visibility=!0,w.scrollable=!0,w.align="top"==M.railvalign?0:1,T.railh=w,T.railh.drag=!1),T.ispage)u.css({position:"fixed",top:0,height:"100%"}),u.css(u.align?{right:0}:{left:0}),T.body.append(u),T.railh&&(w.css({position:"fixed",left:0,width:"100%"}),w.css(w.align?{bottom:0}:{top:0}),T.body.append(w));else{if(T.ishwscroll){"static"==T.win.css("position")&&T.css(T.win,{position:"relative"});var x="HTML"==T.win[0].nodeName?T.body:T.win;n(x).scrollTop(0).scrollLeft(0),T.zoom&&(T.zoom.css({position:"absolute",top:1,right:0,"margin-right":u.width+4}),x.append(T.zoom)),u.css({position:"absolute",top:0}),u.css(u.align?{right:0}:{left:0}),x.append(u),w&&(w.css({position:"absolute",left:0,bottom:0}),w.css(w.align?{bottom:0}:{top:0}),x.append(w))}else{T.isfixed="fixed"==T.win.css("position");var S=T.isfixed?"fixed":"absolute";T.isfixed||(T.viewport=T.getViewport(T.win[0])),T.viewport&&(T.body=T.viewport,/fixed|absolute/.test(T.viewport.css("position"))||T.css(T.viewport,{position:"relative"})),u.css({position:S}),T.zoom&&T.zoom.css({position:S}),T.updateScrollBar(),T.body.append(u),T.zoom&&T.body.append(T.zoom),T.railh&&(w.css({position:S}),T.body.append(w))}P.isios&&T.css(T.win,{"-webkit-tap-highlight-color":"rgba(0,0,0,0)","-webkit-touch-callout":"none"}),M.disableoutline&&(P.isie&&T.win.attr("hideFocus","true"),P.iswebkit&&T.win.css("outline","none"))}if(!1===M.autohidemode?(T.autohidedom=!1,T.rail.css({opacity:M.cursoropacitymax}),T.railh&&T.railh.css({opacity:M.cursoropacitymax})):!0===M.autohidemode||"leave"===M.autohidemode?(T.autohidedom=n().add(T.rail),P.isie8&&(T.autohidedom=T.autohidedom.add(T.cursor)),T.railh&&(T.autohidedom=T.autohidedom.add(T.railh)),T.railh&&P.isie8&&(T.autohidedom=T.autohidedom.add(T.cursorh))):"scroll"==M.autohidemode?(T.autohidedom=n().add(T.rail),T.railh&&(T.autohidedom=T.autohidedom.add(T.railh))):"cursor"==M.autohidemode?(T.autohidedom=n().add(T.cursor),T.railh&&(T.autohidedom=T.autohidedom.add(T.cursorh))):"hidden"==M.autohidemode&&(T.autohidedom=!1,T.hide(),T.railslocked=!1),P.cantouch||T.istouchcapable||M.emulatetouch||P.hasmstouch){T.scrollmom=new y(T);T.ontouchstart=function(e){if(T.locked)return!1;if(e.pointerType&&("mouse"===e.pointerType||e.pointerType===e.MSPOINTER_TYPE_MOUSE))return!1;if(T.hasmoving=!1,T.scrollmom.timer&&(T.triggerScrollEnd(),T.scrollmom.stop()),!T.railslocked){var o=T.getTarget(e);if(o&&/INPUT/i.test(o.nodeName)&&/range/i.test(o.type))return T.stopPropagation(e);var t="mousedown"===e.type;if(!("clientX"in e)&&"changedTouches"in e&&(e.clientX=e.changedTouches[0].clientX,e.clientY=e.changedTouches[0].clientY),T.forcescreen){var r=e;(e={original:e.original?e.original:e}).clientX=r.screenX,e.clientY=r.screenY}if(T.rail.drag={x:e.clientX,y:e.clientY,sx:T.scroll.x,sy:T.scroll.y,st:T.getScrollTop(),sl:T.getScrollLeft(),pt:2,dl:!1,tg:o},T.ispage||!M.directionlockdeadzone)T.rail.drag.dl="f";else{var i={w:c.width(),h:c.height()},s=T.getContentSize(),l=s.h-i.h,a=s.w-i.w;T.rail.scrollable&&!T.railh.scrollable?T.rail.drag.ck=l>0&&"v":!T.rail.scrollable&&T.railh.scrollable?T.rail.drag.ck=a>0&&"h":T.rail.drag.ck=!1}if(M.emulatetouch&&T.isiframe&&P.isie){var d=T.win.position();T.rail.drag.x+=d.left,T.rail.drag.y+=d.top}if(T.hasmoving=!1,T.lastmouseup=!1,T.scrollmom.reset(e.clientX,e.clientY),o&&t){if(!/INPUT|SELECT|BUTTON|TEXTAREA/i.test(o.nodeName))return P.hasmousecapture&&o.setCapture(),M.emulatetouch?(o.onclick&&!o._onclick&&(o._onclick=o.onclick,o.onclick=function(e){if(T.hasmoving)return!1;o._onclick.call(this,e)}),T.cancelEvent(e)):T.stopPropagation(e);/SUBMIT|CANCEL|BUTTON/i.test(n(o).attr("type"))&&(T.preventclick={tg:o,click:!1})}}},T.ontouchend=function(e){if(!T.rail.drag)return!0;if(2==T.rail.drag.pt){if(e.pointerType&&("mouse"===e.pointerType||e.pointerType===e.MSPOINTER_TYPE_MOUSE))return!1;T.rail.drag=!1;var o="mouseup"===e.type;if(T.hasmoving&&(T.scrollmom.doMomentum(),T.lastmouseup=!0,T.hideCursor(),P.hasmousecapture&&l.releaseCapture(),o))return T.cancelEvent(e)}else if(1==T.rail.drag.pt)return T.onmouseup(e)};var z=M.emulatetouch&&T.isiframe&&!P.hasmousecapture,k=.3*M.directionlockdeadzone|0;T.ontouchmove=function(e,o){if(!T.rail.drag)return!0;if(e.targetTouches&&M.preventmultitouchscrolling&&e.targetTouches.length>1)return!0;if(e.pointerType&&("mouse"===e.pointerType||e.pointerType===e.MSPOINTER_TYPE_MOUSE))return!0;if(2==T.rail.drag.pt){"changedTouches"in e&&(e.clientX=e.changedTouches[0].clientX,e.clientY=e.changedTouches[0].clientY);var t,r;if(r=t=0,z&&!o){var i=T.win.position();r=-i.left,t=-i.top}var s=e.clientY+t,n=s-T.rail.drag.y,a=e.clientX+r,c=a-T.rail.drag.x,d=T.rail.drag.st-n;if(T.ishwscroll&&M.bouncescroll)d<0?d=Math.round(d/2):d>T.page.maxh&&(d=T.page.maxh+Math.round((d-T.page.maxh)/2));else if(d<0?(d=0,s=0):d>T.page.maxh&&(d=T.page.maxh,s=0),0===s&&!T.hasmoving)return T.ispage||(T.rail.drag=!1),!0;var u=T.getScrollLeft();if(T.railh&&T.railh.scrollable&&(u=T.isrtlmode?c-T.rail.drag.sl:T.rail.drag.sl-c,T.ishwscroll&&M.bouncescroll?u<0?u=Math.round(u/2):u>T.page.maxw&&(u=T.page.maxw+Math.round((u-T.page.maxw)/2)):(u<0&&(u=0,a=0),u>T.page.maxw&&(u=T.page.maxw,a=0))),!T.hasmoving){if(T.rail.drag.y===e.clientY&&T.rail.drag.x===e.clientX)return T.cancelEvent(e);var h=Math.abs(n),p=Math.abs(c),m=M.directionlockdeadzone;if(T.rail.drag.ck?"v"==T.rail.drag.ck?p>m&&h<=k?T.rail.drag=!1:h>m&&(T.rail.drag.dl="v"):"h"==T.rail.drag.ck&&(h>m&&p<=k?T.rail.drag=!1:p>m&&(T.rail.drag.dl="h")):h>m&&p>m?T.rail.drag.dl="f":h>m?T.rail.drag.dl=p>k?"f":"v":p>m&&(T.rail.drag.dl=h>k?"f":"h"),!T.rail.drag.dl)return T.cancelEvent(e);T.triggerScrollStart(e.clientX,e.clientY,0,0,0),T.hasmoving=!0}return T.preventclick&&!T.preventclick.click&&(T.preventclick.click=T.preventclick.tg.onclick||!1,T.preventclick.tg.onclick=T.onpreventclick),T.rail.drag.dl&&("v"==T.rail.drag.dl?u=T.rail.drag.sl:"h"==T.rail.drag.dl&&(d=T.rail.drag.st)),T.synched("touchmove",function(){T.rail.drag&&2==T.rail.drag.pt&&(T.prepareTransition&&T.resetTransition(),T.rail.scrollable&&T.setScrollTop(d),T.scrollmom.update(a,s),T.railh&&T.railh.scrollable?(T.setScrollLeft(u),T.showCursor(d,u)):T.showCursor(d),P.isie10&&l.selection.clear())}),T.cancelEvent(e)}return 1==T.rail.drag.pt?T.onmousemove(e):void 0},T.ontouchstartCursor=function(e,o){if(!T.rail.drag||3==T.rail.drag.pt){if(T.locked)return T.cancelEvent(e);T.cancelScroll(),T.rail.drag={x:e.touches[0].clientX,y:e.touches[0].clientY,sx:T.scroll.x,sy:T.scroll.y,pt:3,hr:!!o};var t=T.getTarget(e);return!T.ispage&&P.hasmousecapture&&t.setCapture(),T.isiframe&&!P.hasmousecapture&&(T.saved.csspointerevents=T.doc.css("pointer-events"),T.css(T.doc,{"pointer-events":"none"})),T.cancelEvent(e)}},T.ontouchendCursor=function(e){if(T.rail.drag){if(P.hasmousecapture&&l.releaseCapture(),T.isiframe&&!P.hasmousecapture&&T.doc.css("pointer-events",T.saved.csspointerevents),3!=T.rail.drag.pt)return;return T.rail.drag=!1,T.cancelEvent(e)}},T.ontouchmoveCursor=function(e){if(T.rail.drag){if(3!=T.rail.drag.pt)return;if(T.cursorfreezed=!0,T.rail.drag.hr){T.scroll.x=T.rail.drag.sx+(e.touches[0].clientX-T.rail.drag.x),T.scroll.x<0&&(T.scroll.x=0);var o=T.scrollvaluemaxw;T.scroll.x>o&&(T.scroll.x=o)}else{T.scroll.y=T.rail.drag.sy+(e.touches[0].clientY-T.rail.drag.y),T.scroll.y<0&&(T.scroll.y=0);var t=T.scrollvaluemax;T.scroll.y>t&&(T.scroll.y=t)}return T.synched("touchmove",function(){T.rail.drag&&3==T.rail.drag.pt&&(T.showCursor(),T.rail.drag.hr?T.doScrollLeft(Math.round(T.scroll.x*T.scrollratio.x),M.cursordragspeed):T.doScrollTop(Math.round(T.scroll.y*T.scrollratio.y),M.cursordragspeed))}),T.cancelEvent(e)}}}if(T.onmousedown=function(e,o){if(!T.rail.drag||1==T.rail.drag.pt){if(T.railslocked)return T.cancelEvent(e);T.cancelScroll(),T.rail.drag={x:e.clientX,y:e.clientY,sx:T.scroll.x,sy:T.scroll.y,pt:1,hr:o||!1};var t=T.getTarget(e);return P.hasmousecapture&&t.setCapture(),T.isiframe&&!P.hasmousecapture&&(T.saved.csspointerevents=T.doc.css("pointer-events"),T.css(T.doc,{"pointer-events":"none"})),T.hasmoving=!1,T.cancelEvent(e)}},T.onmouseup=function(e){if(T.rail.drag)return 1!=T.rail.drag.pt||(P.hasmousecapture&&l.releaseCapture(),T.isiframe&&!P.hasmousecapture&&T.doc.css("pointer-events",T.saved.csspointerevents),T.rail.drag=!1,T.cursorfreezed=!1,T.hasmoving&&T.triggerScrollEnd(),T.cancelEvent(e))},T.onmousemove=function(e){if(T.rail.drag){if(1!==T.rail.drag.pt)return;if(P.ischrome&&0===e.which)return T.onmouseup(e);if(T.cursorfreezed=!0,T.hasmoving||T.triggerScrollStart(e.clientX,e.clientY,0,0,0),T.hasmoving=!0,T.rail.drag.hr){T.scroll.x=T.rail.drag.sx+(e.clientX-T.rail.drag.x),T.scroll.x<0&&(T.scroll.x=0);var o=T.scrollvaluemaxw;T.scroll.x>o&&(T.scroll.x=o)}else{T.scroll.y=T.rail.drag.sy+(e.clientY-T.rail.drag.y),T.scroll.y<0&&(T.scroll.y=0);var t=T.scrollvaluemax;T.scroll.y>t&&(T.scroll.y=t)}return T.synched("mousemove",function(){T.cursorfreezed&&(T.showCursor(),T.rail.drag.hr?T.scrollLeft(Math.round(T.scroll.x*T.scrollratio.x)):T.scrollTop(Math.round(T.scroll.y*T.scrollratio.y)))}),T.cancelEvent(e)}T.checkarea=0},P.cantouch||M.emulatetouch)T.onpreventclick=function(e){if(T.preventclick)return T.preventclick.tg.onclick=T.preventclick.click,T.preventclick=!1,T.cancelEvent(e)},T.onclick=!P.isios&&function(e){return!T.lastmouseup||(T.lastmouseup=!1,T.cancelEvent(e))},M.grabcursorenabled&&P.cursorgrabvalue&&(T.css(T.ispage?T.doc:T.win,{cursor:P.cursorgrabvalue}),T.css(T.rail,{cursor:P.cursorgrabvalue}));else{var L=function(e){if(T.selectiondrag){if(e){var o=T.win.outerHeight(),t=e.pageY-T.selectiondrag.top;t>0&&t<o&&(t=0),t>=o&&(t-=o),T.selectiondrag.df=t}if(0!==T.selectiondrag.df){var r=-2*T.selectiondrag.df/6|0;T.doScrollBy(r),T.debounced("doselectionscroll",function(){L()},50)}}};T.hasTextSelected="getSelection"in l?function(){return l.getSelection().rangeCount>0}:"selection"in l?function(){return"None"!=l.selection.type}:function(){return!1},T.onselectionstart=function(e){T.ispage||(T.selectiondrag=T.win.offset())},T.onselectionend=function(e){T.selectiondrag=!1},T.onselectiondrag=function(e){T.selectiondrag&&T.hasTextSelected()&&T.debounced("selectionscroll",function(){L(e)},250)}}if(P.hasw3ctouch?(T.css(T.ispage?n("html"):T.win,{"touch-action":"none"}),T.css(T.rail,{"touch-action":"none"}),T.css(T.cursor,{"touch-action":"none"}),T.bind(T.win,"pointerdown",T.ontouchstart),T.bind(l,"pointerup",T.ontouchend),T.delegate(l,"pointermove",T.ontouchmove)):P.hasmstouch?(T.css(T.ispage?n("html"):T.win,{"-ms-touch-action":"none"}),T.css(T.rail,{"-ms-touch-action":"none"}),T.css(T.cursor,{"-ms-touch-action":"none"}),T.bind(T.win,"MSPointerDown",T.ontouchstart),T.bind(l,"MSPointerUp",T.ontouchend),T.delegate(l,"MSPointerMove",T.ontouchmove),T.bind(T.cursor,"MSGestureHold",function(e){e.preventDefault()}),T.bind(T.cursor,"contextmenu",function(e){e.preventDefault()})):P.cantouch&&(T.bind(T.win,"touchstart",T.ontouchstart,!1,!0),T.bind(l,"touchend",T.ontouchend,!1,!0),T.bind(l,"touchcancel",T.ontouchend,!1,!0),T.delegate(l,"touchmove",T.ontouchmove,!1,!0)),M.emulatetouch&&(T.bind(T.win,"mousedown",T.ontouchstart,!1,!0),T.bind(l,"mouseup",T.ontouchend,!1,!0),T.bind(l,"mousemove",T.ontouchmove,!1,!0)),(M.cursordragontouch||!P.cantouch&&!M.emulatetouch)&&(T.rail.css({cursor:"default"}),T.railh&&T.railh.css({cursor:"default"}),T.jqbind(T.rail,"mouseenter",function(){if(!T.ispage&&!T.win.is(":visible"))return!1;T.canshowonmouseevent&&T.showCursor(),T.rail.active=!0}),T.jqbind(T.rail,"mouseleave",function(){T.rail.active=!1,T.rail.drag||T.hideCursor()}),M.sensitiverail&&(T.bind(T.rail,"click",function(e){T.doRailClick(e,!1,!1)}),T.bind(T.rail,"dblclick",function(e){T.doRailClick(e,!0,!1)}),T.bind(T.cursor,"click",function(e){T.cancelEvent(e)}),T.bind(T.cursor,"dblclick",function(e){T.cancelEvent(e)})),T.railh&&(T.jqbind(T.railh,"mouseenter",function(){if(!T.ispage&&!T.win.is(":visible"))return!1;T.canshowonmouseevent&&T.showCursor(),T.rail.active=!0}),T.jqbind(T.railh,"mouseleave",function(){T.rail.active=!1,T.rail.drag||T.hideCursor()}),M.sensitiverail&&(T.bind(T.railh,"click",function(e){T.doRailClick(e,!1,!0)}),T.bind(T.railh,"dblclick",function(e){T.doRailClick(e,!0,!0)}),T.bind(T.cursorh,"click",function(e){T.cancelEvent(e)}),T.bind(T.cursorh,"dblclick",function(e){T.cancelEvent(e)})))),M.cursordragontouch&&(this.istouchcapable||P.cantouch)&&(T.bind(T.cursor,"touchstart",T.ontouchstartCursor),T.bind(T.cursor,"touchmove",T.ontouchmoveCursor),T.bind(T.cursor,"touchend",T.ontouchendCursor),T.cursorh&&T.bind(T.cursorh,"touchstart",function(e){T.ontouchstartCursor(e,!0)}),T.cursorh&&T.bind(T.cursorh,"touchmove",T.ontouchmoveCursor),T.cursorh&&T.bind(T.cursorh,"touchend",T.ontouchendCursor)),M.emulatetouch||P.isandroid||P.isios?(T.bind(P.hasmousecapture?T.win:l,"mouseup",T.ontouchend),T.onclick&&T.bind(l,"click",T.onclick),M.cursordragontouch?(T.bind(T.cursor,"mousedown",T.onmousedown),T.bind(T.cursor,"mouseup",T.onmouseup),T.cursorh&&T.bind(T.cursorh,"mousedown",function(e){T.onmousedown(e,!0)}),T.cursorh&&T.bind(T.cursorh,"mouseup",T.onmouseup)):(T.bind(T.rail,"mousedown",function(e){e.preventDefault()}),T.railh&&T.bind(T.railh,"mousedown",function(e){e.preventDefault()}))):(T.bind(P.hasmousecapture?T.win:l,"mouseup",T.onmouseup),T.bind(l,"mousemove",T.onmousemove),T.onclick&&T.bind(l,"click",T.onclick),T.bind(T.cursor,"mousedown",T.onmousedown),T.bind(T.cursor,"mouseup",T.onmouseup),T.railh&&(T.bind(T.cursorh,"mousedown",function(e){T.onmousedown(e,!0)}),T.bind(T.cursorh,"mouseup",T.onmouseup)),!T.ispage&&M.enablescrollonselection&&(T.bind(T.win[0],"mousedown",T.onselectionstart),T.bind(l,"mouseup",T.onselectionend),T.bind(T.cursor,"mouseup",T.onselectionend),T.cursorh&&T.bind(T.cursorh,"mouseup",T.onselectionend),T.bind(l,"mousemove",T.onselectiondrag)),T.zoom&&(T.jqbind(T.zoom,"mouseenter",function(){T.canshowonmouseevent&&T.showCursor(),T.rail.active=!0}),T.jqbind(T.zoom,"mouseleave",function(){T.rail.active=!1,T.rail.drag||T.hideCursor()}))),M.enablemousewheel&&(T.isiframe||T.mousewheel(P.isie&&T.ispage?l:T.win,T.onmousewheel),T.mousewheel(T.rail,T.onmousewheel),T.railh&&T.mousewheel(T.railh,T.onmousewheelhr)),T.ispage||P.cantouch||/HTML|^BODY/.test(T.win[0].nodeName)||(T.win.attr("tabindex")||T.win.attr({tabindex:++r}),T.bind(T.win,"focus",function(e){o=T.getTarget(e).id||T.getTarget(e)||!1,T.hasfocus=!0,T.canshowonmouseevent&&T.noticeCursor()}),T.bind(T.win,"blur",function(e){o=!1,T.hasfocus=!1}),T.bind(T.win,"mouseenter",function(e){t=T.getTarget(e).id||T.getTarget(e)||!1,T.hasmousefocus=!0,T.canshowonmouseevent&&T.noticeCursor()}),T.bind(T.win,"mouseleave",function(e){t=!1,T.hasmousefocus=!1,T.rail.drag||T.hideCursor()})),T.onkeypress=function(e){if(T.railslocked&&0===T.page.maxh)return!0;e=e||a.event;var r=T.getTarget(e);if(r&&/INPUT|TEXTAREA|SELECT|OPTION/.test(r.nodeName)&&(!(r.getAttribute("type")||r.type||!1)||!/submit|button|cancel/i.tp))return!0;if(n(r).attr("contenteditable"))return!0;if(T.hasfocus||T.hasmousefocus&&!o||T.ispage&&!o&&!t){var i=e.keyCode;if(T.railslocked&&27!=i)return T.cancelEvent(e);var s=e.ctrlKey||!1,l=e.shiftKey||!1,c=!1;switch(i){case 38:case 63233:T.doScrollBy(72),c=!0;break;case 40:case 63235:T.doScrollBy(-72),c=!0;break;case 37:case 63232:T.railh&&(s?T.doScrollLeft(0):T.doScrollLeftBy(72),c=!0);break;case 39:case 63234:T.railh&&(s?T.doScrollLeft(T.page.maxw):T.doScrollLeftBy(-72),c=!0);break;case 33:case 63276:T.doScrollBy(T.view.h),c=!0;break;case 34:case 63277:T.doScrollBy(-T.view.h),c=!0;break;case 36:case 63273:T.railh&&s?T.doScrollPos(0,0):T.doScrollTo(0),c=!0;break;case 35:case 63275:T.railh&&s?T.doScrollPos(T.page.maxw,T.page.maxh):T.doScrollTo(T.page.maxh),c=!0;break;case 32:M.spacebarenabled&&(l?T.doScrollBy(T.view.h):T.doScrollBy(-T.view.h),c=!0);break;case 27:T.zoomactive&&(T.doZoom(),c=!0)}if(c)return T.cancelEvent(e)}},M.enablekeyboard&&T.bind(l,P.isopera&&!P.isopera12?"keypress":"keydown",T.onkeypress),T.bind(l,"keydown",function(e){(e.ctrlKey||!1)&&(T.wheelprevented=!0)}),T.bind(l,"keyup",function(e){e.ctrlKey||!1||(T.wheelprevented=!1)}),T.bind(a,"blur",function(e){T.wheelprevented=!1}),T.bind(a,"resize",T.onscreenresize),T.bind(a,"orientationchange",T.onscreenresize),T.bind(a,"load",T.lazyResize),P.ischrome&&!T.ispage&&!T.haswrapper){var C=T.win.attr("style"),N=parseFloat(T.win.css("width"))+1;T.win.css("width",N),T.synched("chromefix",function(){T.win.attr("style",C)})}if(T.onAttributeChange=function(e){T.lazyResize(T.isieold?250:30)},M.enableobserver&&(T.isie11||!1===m||(T.observerbody=new m(function(e){if(e.forEach(function(e){if("attributes"==e.type)return E.hasClass("modal-open")&&E.hasClass("modal-dialog")&&!n.contains(n(".modal-dialog")[0],T.doc[0])?T.hide():T.show()}),T.me.clientWidth!=T.page.width||T.me.clientHeight!=T.page.height)return T.lazyResize(30)}),T.observerbody.observe(l.body,{childList:!0,subtree:!0,characterData:!1,attributes:!0,attributeFilter:["class"]})),!T.ispage&&!T.haswrapper)){var R=T.win[0];!1!==m?(T.observer=new m(function(e){e.forEach(T.onAttributeChange)}),T.observer.observe(R,{childList:!0,characterData:!1,attributes:!0,subtree:!1}),T.observerremover=new m(function(e){e.forEach(function(e){if(e.removedNodes.length>0)for(var o in e.removedNodes)if(T&&e.removedNodes[o]===R)return T.remove()})}),T.observerremover.observe(R.parentNode,{childList:!0,characterData:!1,attributes:!1,subtree:!1})):(T.bind(R,P.isie&&!P.isie9?"propertychange":"DOMAttrModified",T.onAttributeChange),P.isie9&&R.attachEvent("onpropertychange",T.onAttributeChange),T.bind(R,"DOMNodeRemoved",function(e){e.target===R&&T.remove()}))}!T.ispage&&M.boxzoom&&T.bind(a,"resize",T.resizeZoom),T.istextarea&&(T.bind(T.win,"keydown",T.lazyResize),T.bind(T.win,"mouseup",T.lazyResize)),T.lazyResize(30)}if("IFRAME"==this.doc[0].nodeName){var _=function(){T.iframexd=!1;var o;try{(o="contentDocument"in this?this.contentDocument:this.contentWindow._doc).domain}catch(e){T.iframexd=!0,o=!1}if(T.iframexd)return"console"in a&&console.log("NiceScroll error: policy restriced iframe"),!0;if(T.forcescreen=!0,T.isiframe&&(T.iframe={doc:n(o),html:T.doc.contents().find("html")[0],body:T.doc.contents().find("body")[0]},T.getContentSize=function(){return{w:Math.max(T.iframe.html.scrollWidth,T.iframe.body.scrollWidth),h:Math.max(T.iframe.html.scrollHeight,T.iframe.body.scrollHeight)}},T.docscroll=n(T.iframe.body)),!P.isios&&M.iframeautoresize&&!T.isiframe){T.win.scrollTop(0),T.doc.height("");var t=Math.max(o.getElementsByTagName("html")[0].scrollHeight,o.body.scrollHeight);T.doc.height(t)}T.lazyResize(30),T.css(n(T.iframe.body),e),P.isios&&T.haswrapper&&T.css(n(o.body),{"-webkit-transform":"translate3d(0,0,0)"}),"contentWindow"in this?T.bind(this.contentWindow,"scroll",T.onscroll):T.bind(o,"scroll",T.onscroll),M.enablemousewheel&&T.mousewheel(o,T.onmousewheel),M.enablekeyboard&&T.bind(o,P.isopera?"keypress":"keydown",T.onkeypress),P.cantouch?(T.bind(o,"touchstart",T.ontouchstart),T.bind(o,"touchmove",T.ontouchmove)):M.emulatetouch&&(T.bind(o,"mousedown",T.ontouchstart),T.bind(o,"mousemove",function(e){return T.ontouchmove(e,!0)}),M.grabcursorenabled&&P.cursorgrabvalue&&T.css(n(o.body),{cursor:P.cursorgrabvalue})),T.bind(o,"mouseup",T.ontouchend),T.zoom&&(M.dblclickzoom&&T.bind(o,"dblclick",T.doZoom),T.ongesturezoom&&T.bind(o,"gestureend",T.ongesturezoom))};this.doc[0].readyState&&"complete"===this.doc[0].readyState&&setTimeout(function(){_.call(T.doc[0],!1)},500),T.bind(this.doc,"load",_)}},this.showCursor=function(e,o){if(T.cursortimeout&&(clearTimeout(T.cursortimeout),T.cursortimeout=0),T.rail){if(T.autohidedom&&(T.autohidedom.stop().css({opacity:M.cursoropacitymax}),T.cursoractive=!0),T.rail.drag&&1==T.rail.drag.pt||(void 0!==e&&!1!==e&&(T.scroll.y=e/T.scrollratio.y|0),void 0!==o&&(T.scroll.x=o/T.scrollratio.x|0)),T.cursor.css({height:T.cursorheight,top:T.scroll.y}),T.cursorh){var t=T.hasreversehr?T.scrollvaluemaxw-T.scroll.x:T.scroll.x;T.cursorh.css({width:T.cursorwidth,left:!T.rail.align&&T.rail.visibility?t+T.rail.width:t}),T.cursoractive=!0}T.zoom&&T.zoom.stop().css({opacity:M.cursoropacitymax})}},this.hideCursor=function(e){T.cursortimeout||T.rail&&T.autohidedom&&(T.hasmousefocus&&"leave"===M.autohidemode||(T.cursortimeout=setTimeout(function(){T.rail.active&&T.showonmouseevent||(T.autohidedom.stop().animate({opacity:M.cursoropacitymin}),T.zoom&&T.zoom.stop().animate({opacity:M.cursoropacitymin}),T.cursoractive=!1),T.cursortimeout=0},e||M.hidecursordelay)))},this.noticeCursor=function(e,o,t){T.showCursor(o,t),T.rail.active||T.hideCursor(e)},this.getContentSize=T.ispage?function(){return{w:Math.max(l.body.scrollWidth,l.documentElement.scrollWidth),h:Math.max(l.body.scrollHeight,l.documentElement.scrollHeight)}}:T.haswrapper?function(){return{w:T.doc[0].offsetWidth,h:T.doc[0].offsetHeight}}:function(){return{w:T.docscroll[0].scrollWidth,h:T.docscroll[0].scrollHeight}},this.onResize=function(e,o){if(!T||!T.win)return!1;var t=T.page.maxh,r=T.page.maxw,i=T.view.h,s=T.view.w;if(T.view={w:T.ispage?T.win.width():T.win[0].clientWidth,h:T.ispage?T.win.height():T.win[0].clientHeight},T.page=o||T.getContentSize(),T.page.maxh=Math.max(0,T.page.h-T.view.h),T.page.maxw=Math.max(0,T.page.w-T.view.w),T.page.maxh==t&&T.page.maxw==r&&T.view.w==s&&T.view.h==i){if(T.ispage)return T;var n=T.win.offset();if(T.lastposition){var l=T.lastposition;if(l.top==n.top&&l.left==n.left)return T}T.lastposition=n}return 0===T.page.maxh?(T.hideRail(),T.scrollvaluemax=0,T.scroll.y=0,T.scrollratio.y=0,T.cursorheight=0,T.setScrollTop(0),T.rail&&(T.rail.scrollable=!1)):(T.page.maxh-=M.railpadding.top+M.railpadding.bottom,T.rail.scrollable=!0),0===T.page.maxw?(T.hideRailHr(),T.scrollvaluemaxw=0,T.scroll.x=0,T.scrollratio.x=0,T.cursorwidth=0,T.setScrollLeft(0),T.railh&&(T.railh.scrollable=!1)):(T.page.maxw-=M.railpadding.left+M.railpadding.right,T.railh&&(T.railh.scrollable=M.horizrailenabled)),T.railslocked=T.locked||0===T.page.maxh&&0===T.page.maxw,T.railslocked?(T.ispage||T.updateScrollBar(T.view),!1):(T.hidden||(T.rail.visibility||T.showRail(),T.railh&&!T.railh.visibility&&T.showRailHr()),T.istextarea&&T.win.css("resize")&&"none"!=T.win.css("resize")&&(T.view.h-=20),T.cursorheight=Math.min(T.view.h,Math.round(T.view.h*(T.view.h/T.page.h))),T.cursorheight=M.cursorfixedheight?M.cursorfixedheight:Math.max(M.cursorminheight,T.cursorheight),T.cursorwidth=Math.min(T.view.w,Math.round(T.view.w*(T.view.w/T.page.w))),T.cursorwidth=M.cursorfixedheight?M.cursorfixedheight:Math.max(M.cursorminheight,T.cursorwidth),T.scrollvaluemax=T.view.h-T.cursorheight-(M.railpadding.top+M.railpadding.bottom),T.hasborderbox||(T.scrollvaluemax-=T.cursor[0].offsetHeight-T.cursor[0].clientHeight),T.railh&&(T.railh.width=T.page.maxh>0?T.view.w-T.rail.width:T.view.w,T.scrollvaluemaxw=T.railh.width-T.cursorwidth-(M.railpadding.left+M.railpadding.right)),T.ispage||T.updateScrollBar(T.view),T.scrollratio={x:T.page.maxw/T.scrollvaluemaxw,y:T.page.maxh/T.scrollvaluemax},T.getScrollTop()>T.page.maxh?T.doScrollTop(T.page.maxh):(T.scroll.y=T.getScrollTop()/T.scrollratio.y|0,T.scroll.x=T.getScrollLeft()/T.scrollratio.x|0,T.cursoractive&&T.noticeCursor()),T.scroll.y&&0===T.getScrollTop()&&T.doScrollTo(T.scroll.y*T.scrollratio.y|0),T)},this.resize=T.onResize;var O=0;this.onscreenresize=function(e){clearTimeout(O);var o=!T.ispage&&!T.haswrapper;o&&T.hideRails(),O=setTimeout(function(){T&&(o&&T.showRails(),T.resize()),O=0},120)},this.lazyResize=function(e){return clearTimeout(O),e=isNaN(e)?240:e,O=setTimeout(function(){T&&T.resize(),O=0},e),T},this.jqbind=function(e,o,t){T.events.push({e:e,n:o,f:t,q:!0}),n(e).on(o,t)},this.mousewheel=function(e,o,t){var r="jquery"in e?e[0]:e;if("onwheel"in l.createElement("div"))T._bind(r,"wheel",o,t||!1);else{var i=void 0!==l.onmousewheel?"mousewheel":"DOMMouseScroll";S(r,i,o,t||!1),"DOMMouseScroll"==i&&S(r,"MozMousePixelScroll",o,t||!1)}};var Y=!1;if(P.haseventlistener){try{var H=Object.defineProperty({},"passive",{get:function(){Y=!0}});a.addEventListener("test",null,H)}catch(e){}this.stopPropagation=function(e){return!!e&&((e=e.original?e.original:e).stopPropagation(),!1)},this.cancelEvent=function(e){return e.cancelable&&e.preventDefault(),e.stopImmediatePropagation(),e.preventManipulation&&e.preventManipulation(),!1}}else Event.prototype.preventDefault=function(){this.returnValue=!1},Event.prototype.stopPropagation=function(){this.cancelBubble=!0},a.constructor.prototype.addEventListener=l.constructor.prototype.addEventListener=Element.prototype.addEventListener=function(e,o,t){this.attachEvent("on"+e,o)},a.constructor.prototype.removeEventListener=l.constructor.prototype.removeEventListener=Element.prototype.removeEventListener=function(e,o,t){this.detachEvent("on"+e,o)},this.cancelEvent=function(e){return(e=e||a.event)&&(e.cancelBubble=!0,e.cancel=!0,e.returnValue=!1),!1},this.stopPropagation=function(e){return(e=e||a.event)&&(e.cancelBubble=!0),!1};this.delegate=function(e,o,t,r,i){var s=d[o]||!1;s||(s={a:[],l:[],f:function(e){for(var o=s.l,t=!1,r=o.length-1;r>=0;r--)if(!1===(t=o[r].call(e.target,e)))return!1;return t}},T.bind(e,o,s.f,r,i),d[o]=s),T.ispage?(s.a=[T.id].concat(s.a),s.l=[t].concat(s.l)):(s.a.push(T.id),s.l.push(t))},this.undelegate=function(e,o,t,r,i){var s=d[o]||!1;if(s&&s.l)for(var n=0,l=s.l.length;n<l;n++)s.a[n]===T.id&&(s.a.splice(n),s.l.splice(n),0===s.a.length&&(T._unbind(e,o,s.l.f),d[o]=null))},this.bind=function(e,o,t,r,i){var s="jquery"in e?e[0]:e;T._bind(s,o,t,r||!1,i||!1)},this._bind=function(e,o,t,r,i){T.events.push({e:e,n:o,f:t,b:r,q:!1}),Y&&i?e.addEventListener(o,t,{passive:!1,capture:r}):e.addEventListener(o,t,r||!1)},this._unbind=function(e,o,t,r){d[o]?T.undelegate(e,o,t,r):e.removeEventListener(o,t,r)},this.unbindAll=function(){for(var e=0;e<T.events.length;e++){var o=T.events[e];o.q?o.e.unbind(o.n,o.f):T._unbind(o.e,o.n,o.f,o.b)}},this.showRails=function(){return T.showRail().showRailHr()},this.showRail=function(){return 0===T.page.maxh||!T.ispage&&"none"==T.win.css("display")||(T.rail.visibility=!0,T.rail.css("display","block")),T},this.showRailHr=function(){return T.railh&&(0===T.page.maxw||!T.ispage&&"none"==T.win.css("display")||(T.railh.visibility=!0,T.railh.css("display","block"))),T},this.hideRails=function(){return T.hideRail().hideRailHr()},this.hideRail=function(){return T.rail.visibility=!1,T.rail.css("display","none"),T},this.hideRailHr=function(){return T.railh&&(T.railh.visibility=!1,T.railh.css("display","none")),T},this.show=function(){return T.hidden=!1,T.railslocked=!1,T.showRails()},this.hide=function(){return T.hidden=!0,T.railslocked=!0,T.hideRails()},this.toggle=function(){return T.hidden?T.show():T.hide()},this.remove=function(){T.stop(),T.cursortimeout&&clearTimeout(T.cursortimeout);for(var e in T.delaylist)T.delaylist[e]&&h(T.delaylist[e].h);T.doZoomOut(),T.unbindAll(),P.isie9&&T.win[0].detachEvent("onpropertychange",T.onAttributeChange),!1!==T.observer&&T.observer.disconnect(),!1!==T.observerremover&&T.observerremover.disconnect(),!1!==T.observerbody&&T.observerbody.disconnect(),T.events=null,T.cursor&&T.cursor.remove(),T.cursorh&&T.cursorh.remove(),T.rail&&T.rail.remove(),T.railh&&T.railh.remove(),T.zoom&&T.zoom.remove();for(var o=0;o<T.saved.css.length;o++){var t=T.saved.css[o];t[0].css(t[1],void 0===t[2]?"":t[2])}T.saved=!1,T.me.data("__nicescroll","");var r=n.nicescroll;r.each(function(e){if(this&&this.id===T.id){delete r[e];for(var o=++e;o<r.length;o++,e++)r[e]=r[o];--r.length&&delete r[r.length]}});for(var i in T)T[i]=null,delete T[i];T=null},this.scrollstart=function(e){return this.onscrollstart=e,T},this.scrollend=function(e){return this.onscrollend=e,T},this.scrollcancel=function(e){return this.onscrollcancel=e,T},this.zoomin=function(e){return this.onzoomin=e,T},this.zoomout=function(e){return this.onzoomout=e,T},this.isScrollable=function(e){var o=e.target?e.target:e;if("OPTION"==o.nodeName)return!0;for(;o&&1==o.nodeType&&o!==this.me[0]&&!/^BODY|HTML/.test(o.nodeName);){var t=n(o),r=t.css("overflowY")||t.css("overflowX")||t.css("overflow")||"";if(/scroll|auto/.test(r))return o.clientHeight!=o.scrollHeight;o=!!o.parentNode&&o.parentNode}return!1},this.getViewport=function(e){for(var o=!(!e||!e.parentNode)&&e.parentNode;o&&1==o.nodeType&&!/^BODY|HTML/.test(o.nodeName);){var t=n(o);if(/fixed|absolute/.test(t.css("position")))return t;var r=t.css("overflowY")||t.css("overflowX")||t.css("overflow")||"";if(/scroll|auto/.test(r)&&o.clientHeight!=o.scrollHeight)return t;if(t.getNiceScroll().length>0)return t;o=!!o.parentNode&&o.parentNode}return!1},this.triggerScrollStart=function(e,o,t,r,i){if(T.onscrollstart){var s={type:"scrollstart",current:{x:e,y:o},request:{x:t,y:r},end:{x:T.newscrollx,y:T.newscrolly},speed:i};T.onscrollstart.call(T,s)}},this.triggerScrollEnd=function(){if(T.onscrollend){var e=T.getScrollLeft(),o=T.getScrollTop(),t={type:"scrollend",current:{x:e,y:o},end:{x:e,y:o}};T.onscrollend.call(T,t)}};var B=0,X=0,D=0,A=1,q=!1;if(this.onmousewheel=function(e){if(T.wheelprevented||T.locked)return!1;if(T.railslocked)return T.debounced("checkunlock",T.resize,250),!1;if(T.rail.drag)return T.cancelEvent(e);if("auto"===M.oneaxismousemode&&0!==e.deltaX&&(M.oneaxismousemode=!1),M.oneaxismousemode&&0===e.deltaX&&!T.rail.scrollable)return!T.railh||!T.railh.scrollable||T.onmousewheelhr(e);var o=f(),t=!1;if(M.preservenativescrolling&&T.checkarea+600<o&&(T.nativescrollingarea=T.isScrollable(e),t=!0),T.checkarea=o,T.nativescrollingarea)return!0;var r=k(e,!1,t);return r&&(T.checkarea=0),r},this.onmousewheelhr=function(e){if(!T.wheelprevented){if(T.railslocked||!T.railh.scrollable)return!0;if(T.rail.drag)return T.cancelEvent(e);var o=f(),t=!1;return M.preservenativescrolling&&T.checkarea+600<o&&(T.nativescrollingarea=T.isScrollable(e),t=!0),T.checkarea=o,!!T.nativescrollingarea||(T.railslocked?T.cancelEvent(e):k(e,!0,t))}},this.stop=function(){return T.cancelScroll(),T.scrollmon&&T.scrollmon.stop(),T.cursorfreezed=!1,T.scroll.y=Math.round(T.getScrollTop()*(1/T.scrollratio.y)),T.noticeCursor(),T},this.getTransitionSpeed=function(e){return 80+e/72*M.scrollspeed|0},M.smoothscroll)if(T.ishwscroll&&P.hastransition&&M.usetransition&&M.smoothscroll){var j="";this.resetTransition=function(){j="",T.doc.css(P.prefixstyle+"transition-duration","0ms")},this.prepareTransition=function(e,o){var t=o?e:T.getTransitionSpeed(e),r=t+"ms";return j!==r&&(j=r,T.doc.css(P.prefixstyle+"transition-duration",r)),t},this.doScrollLeft=function(e,o){var t=T.scrollrunning?T.newscrolly:T.getScrollTop();T.doScrollPos(e,t,o)},this.doScrollTop=function(e,o){var t=T.scrollrunning?T.newscrollx:T.getScrollLeft();T.doScrollPos(t,e,o)},this.cursorupdate={running:!1,start:function(){var e=this;if(!e.running){e.running=!0;var o=function(){e.running&&u(o),T.showCursor(T.getScrollTop(),T.getScrollLeft()),T.notifyScrollEvent(T.win[0])};u(o)}},stop:function(){this.running=!1}},this.doScrollPos=function(e,o,t){var r=T.getScrollTop(),i=T.getScrollLeft();if(((T.newscrolly-r)*(o-r)<0||(T.newscrollx-i)*(e-i)<0)&&T.cancelScroll(),M.bouncescroll?(o<0?o=o/2|0:o>T.page.maxh&&(o=T.page.maxh+(o-T.page.maxh)/2|0),e<0?e=e/2|0:e>T.page.maxw&&(e=T.page.maxw+(e-T.page.maxw)/2|0)):(o<0?o=0:o>T.page.maxh&&(o=T.page.maxh),e<0?e=0:e>T.page.maxw&&(e=T.page.maxw)),T.scrollrunning&&e==T.newscrollx&&o==T.newscrolly)return!1;T.newscrolly=o,T.newscrollx=e;var s=T.getScrollTop(),n=T.getScrollLeft(),l={};l.x=e-n,l.y=o-s;var a=0|Math.sqrt(l.x*l.x+l.y*l.y),c=T.prepareTransition(a);T.scrollrunning||(T.scrollrunning=!0,T.triggerScrollStart(n,s,e,o,c),T.cursorupdate.start()),T.scrollendtrapped=!0,P.transitionend||(T.scrollendtrapped&&clearTimeout(T.scrollendtrapped),T.scrollendtrapped=setTimeout(T.onScrollTransitionEnd,c)),T.setScrollTop(T.newscrolly),T.setScrollLeft(T.newscrollx)},this.cancelScroll=function(){if(!T.scrollendtrapped)return!0;var e=T.getScrollTop(),o=T.getScrollLeft();return T.scrollrunning=!1,P.transitionend||clearTimeout(P.transitionend),T.scrollendtrapped=!1,T.resetTransition(),T.setScrollTop(e),T.railh&&T.setScrollLeft(o),T.timerscroll&&T.timerscroll.tm&&clearInterval(T.timerscroll.tm),T.timerscroll=!1,T.cursorfreezed=!1,T.cursorupdate.stop(),T.showCursor(e,o),T},this.onScrollTransitionEnd=function(){if(T.scrollendtrapped){var e=T.getScrollTop(),o=T.getScrollLeft();if(e<0?e=0:e>T.page.maxh&&(e=T.page.maxh),o<0?o=0:o>T.page.maxw&&(o=T.page.maxw),e!=T.newscrolly||o!=T.newscrollx)return T.doScrollPos(o,e,M.snapbackspeed);T.scrollrunning&&T.triggerScrollEnd(),T.scrollrunning=!1,T.scrollendtrapped=!1,T.resetTransition(),T.timerscroll=!1,T.setScrollTop(e),T.railh&&T.setScrollLeft(o),T.cursorupdate.stop(),T.noticeCursor(!1,e,o),T.cursorfreezed=!1}}}else this.doScrollLeft=function(e,o){var t=T.scrollrunning?T.newscrolly:T.getScrollTop();T.doScrollPos(e,t,o)},this.doScrollTop=function(e,o){var t=T.scrollrunning?T.newscrollx:T.getScrollLeft();T.doScrollPos(t,e,o)},this.doScrollPos=function(e,o,t){var r=T.getScrollTop(),i=T.getScrollLeft();((T.newscrolly-r)*(o-r)<0||(T.newscrollx-i)*(e-i)<0)&&T.cancelScroll();var s=!1;if(T.bouncescroll&&T.rail.visibility||(o<0?(o=0,s=!0):o>T.page.maxh&&(o=T.page.maxh,s=!0)),T.bouncescroll&&T.railh.visibility||(e<0?(e=0,s=!0):e>T.page.maxw&&(e=T.page.maxw,s=!0)),T.scrollrunning&&T.newscrolly===o&&T.newscrollx===e)return!0;T.newscrolly=o,T.newscrollx=e,T.dst={},T.dst.x=e-i,T.dst.y=o-r,T.dst.px=i,T.dst.py=r;var n=0|Math.sqrt(T.dst.x*T.dst.x+T.dst.y*T.dst.y),l=T.getTransitionSpeed(n);T.bzscroll={};var a=s?1:.58;T.bzscroll.x=new R(i,T.newscrollx,l,0,0,a,1),T.bzscroll.y=new R(r,T.newscrolly,l,0,0,a,1);f();var c=function(){if(T.scrollrunning){var e=T.bzscroll.y.getPos();T.setScrollLeft(T.bzscroll.x.getNow()),T.setScrollTop(T.bzscroll.y.getNow()),e<=1?T.timer=u(c):(T.scrollrunning=!1,T.timer=0,T.triggerScrollEnd())}};T.scrollrunning||(T.triggerScrollStart(i,r,e,o,l),T.scrollrunning=!0,T.timer=u(c))},this.cancelScroll=function(){return T.timer&&h(T.timer),T.timer=0,T.bzscroll=!1,T.scrollrunning=!1,T};else this.doScrollLeft=function(e,o){var t=T.getScrollTop();T.doScrollPos(e,t,o)},this.doScrollTop=function(e,o){var t=T.getScrollLeft();T.doScrollPos(t,e,o)},this.doScrollPos=function(e,o,t){var r=e>T.page.maxw?T.page.maxw:e;r<0&&(r=0);var i=o>T.page.maxh?T.page.maxh:o;i<0&&(i=0),T.synched("scroll",function(){T.setScrollTop(i),T.setScrollLeft(r)})},this.cancelScroll=function(){};this.doScrollBy=function(e,o){z(0,e)},this.doScrollLeftBy=function(e,o){z(e,0)},this.doScrollTo=function(e,o){var t=o?Math.round(e*T.scrollratio.y):e;t<0?t=0:t>T.page.maxh&&(t=T.page.maxh),T.cursorfreezed=!1,T.doScrollTop(e)},this.checkContentSize=function(){var e=T.getContentSize();e.h==T.page.h&&e.w==T.page.w||T.resize(!1,e)},T.onscroll=function(e){T.rail.drag||T.cursorfreezed||T.synched("scroll",function(){T.scroll.y=Math.round(T.getScrollTop()/T.scrollratio.y),T.railh&&(T.scroll.x=Math.round(T.getScrollLeft()/T.scrollratio.x)),T.noticeCursor()})},T.bind(T.docscroll,"scroll",T.onscroll),this.doZoomIn=function(e){if(!T.zoomactive){T.zoomactive=!0,T.zoomrestore={style:{}};var o=["position","top","left","zIndex","backgroundColor","marginTop","marginBottom","marginLeft","marginRight"],t=T.win[0].style;for(var r in o){var i=o[r];T.zoomrestore.style[i]=void 0!==t[i]?t[i]:""}T.zoomrestore.style.width=T.win.css("width"),T.zoomrestore.style.height=T.win.css("height"),T.zoomrestore.padding={w:T.win.outerWidth()-T.win.width(),h:T.win.outerHeight()-T.win.height()},P.isios4&&(T.zoomrestore.scrollTop=c.scrollTop(),c.scrollTop(0)),T.win.css({position:P.isios4?"absolute":"fixed",top:0,left:0,zIndex:s+100,margin:0});var n=T.win.css("backgroundColor");return(""===n||/transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(n))&&T.win.css("backgroundColor","#fff"),T.rail.css({zIndex:s+101}),T.zoom.css({zIndex:s+102}),T.zoom.css("backgroundPosition","0 -18px"),T.resizeZoom(),T.onzoomin&&T.onzoomin.call(T),T.cancelEvent(e)}},this.doZoomOut=function(e){if(T.zoomactive)return T.zoomactive=!1,T.win.css("margin",""),T.win.css(T.zoomrestore.style),P.isios4&&c.scrollTop(T.zoomrestore.scrollTop),T.rail.css({"z-index":T.zindex}),T.zoom.css({"z-index":T.zindex}),T.zoomrestore=!1,T.zoom.css("backgroundPosition","0 0"),T.onResize(),T.onzoomout&&T.onzoomout.call(T),T.cancelEvent(e)},this.doZoom=function(e){return T.zoomactive?T.doZoomOut(e):T.doZoomIn(e)},this.resizeZoom=function(){if(T.zoomactive){var e=T.getScrollTop();T.win.css({width:c.width()-T.zoomrestore.padding.w+"px",height:c.height()-T.zoomrestore.padding.h+"px"}),T.onResize(),T.setScrollTop(Math.min(T.page.maxh,e))}},this.init(),n.nicescroll.push(this)},y=function(e){var o=this;this.nc=e,this.lastx=0,this.lasty=0,this.speedx=0,this.speedy=0,this.lasttime=0,this.steptime=0,this.snapx=!1,this.snapy=!1,this.demulx=0,this.demuly=0,this.lastscrollx=-1,this.lastscrolly=-1,this.chkx=0,this.chky=0,this.timer=0,this.reset=function(e,t){o.stop(),o.steptime=0,o.lasttime=f(),o.speedx=0,o.speedy=0,o.lastx=e,o.lasty=t,o.lastscrollx=-1,o.lastscrolly=-1},this.update=function(e,t){var r=f();o.steptime=r-o.lasttime,o.lasttime=r;var i=t-o.lasty,s=e-o.lastx,n=o.nc.getScrollTop()+i,l=o.nc.getScrollLeft()+s;o.snapx=l<0||l>o.nc.page.maxw,o.snapy=n<0||n>o.nc.page.maxh,o.speedx=s,o.speedy=i,o.lastx=e,o.lasty=t},this.stop=function(){o.nc.unsynched("domomentum2d"),o.timer&&clearTimeout(o.timer),o.timer=0,o.lastscrollx=-1,o.lastscrolly=-1},this.doSnapy=function(e,t){var r=!1;t<0?(t=0,r=!0):t>o.nc.page.maxh&&(t=o.nc.page.maxh,r=!0),e<0?(e=0,r=!0):e>o.nc.page.maxw&&(e=o.nc.page.maxw,r=!0),r?o.nc.doScrollPos(e,t,o.nc.opt.snapbackspeed):o.nc.triggerScrollEnd()},this.doMomentum=function(e){var t=f(),r=e?t+e:o.lasttime,i=o.nc.getScrollLeft(),s=o.nc.getScrollTop(),n=o.nc.page.maxh,l=o.nc.page.maxw;o.speedx=l>0?Math.min(60,o.speedx):0,o.speedy=n>0?Math.min(60,o.speedy):0;var a=r&&t-r<=60;(s<0||s>n||i<0||i>l)&&(a=!1);var c=!(!o.speedy||!a)&&o.speedy,d=!(!o.speedx||!a)&&o.speedx;if(c||d){var u=Math.max(16,o.steptime);if(u>50){var h=u/50;o.speedx*=h,o.speedy*=h,u=50}o.demulxy=0,o.lastscrollx=o.nc.getScrollLeft(),o.chkx=o.lastscrollx,o.lastscrolly=o.nc.getScrollTop(),o.chky=o.lastscrolly;var p=o.lastscrollx,m=o.lastscrolly,g=function(){var e=f()-t>600?.04:.02;o.speedx&&(p=Math.floor(o.lastscrollx-o.speedx*(1-o.demulxy)),o.lastscrollx=p,(p<0||p>l)&&(e=.1)),o.speedy&&(m=Math.floor(o.lastscrolly-o.speedy*(1-o.demulxy)),o.lastscrolly=m,(m<0||m>n)&&(e=.1)),o.demulxy=Math.min(1,o.demulxy+e),o.nc.synched("domomentum2d",function(){if(o.speedx){o.nc.getScrollLeft();o.chkx=p,o.nc.setScrollLeft(p)}if(o.speedy){o.nc.getScrollTop();o.chky=m,o.nc.setScrollTop(m)}o.timer||(o.nc.hideCursor(),o.doSnapy(p,m))}),o.demulxy<1?o.timer=setTimeout(g,u):(o.stop(),o.nc.hideCursor(),o.doSnapy(p,m))};g()}else o.doSnapy(o.nc.getScrollLeft(),o.nc.getScrollTop())}},x=e.fn.scrollTop;e.cssHooks.pageYOffset={get:function(e,o,t){var r=n.data(e,"__nicescroll")||!1;return r&&r.ishwscroll?r.getScrollTop():x.call(e)},set:function(e,o){var t=n.data(e,"__nicescroll")||!1;return t&&t.ishwscroll?t.setScrollTop(parseInt(o)):x.call(e,o),this}},e.fn.scrollTop=function(e){if(void 0===e){var o=!!this[0]&&(n.data(this[0],"__nicescroll")||!1);return o&&o.ishwscroll?o.getScrollTop():x.call(this)}return this.each(function(){var o=n.data(this,"__nicescroll")||!1;o&&o.ishwscroll?o.setScrollTop(parseInt(e)):x.call(n(this),e)})};var S=e.fn.scrollLeft;n.cssHooks.pageXOffset={get:function(e,o,t){var r=n.data(e,"__nicescroll")||!1;return r&&r.ishwscroll?r.getScrollLeft():S.call(e)},set:function(e,o){var t=n.data(e,"__nicescroll")||!1;return t&&t.ishwscroll?t.setScrollLeft(parseInt(o)):S.call(e,o),this}},e.fn.scrollLeft=function(e){if(void 0===e){var o=!!this[0]&&(n.data(this[0],"__nicescroll")||!1);return o&&o.ishwscroll?o.getScrollLeft():S.call(this)}return this.each(function(){var o=n.data(this,"__nicescroll")||!1;o&&o.ishwscroll?o.setScrollLeft(parseInt(e)):S.call(n(this),e)})};var z=function(e){var o=this;if(this.length=0,this.name="nicescrollarray",this.each=function(e){return n.each(o,e),o},this.push=function(e){o[o.length]=e,o.length++},this.eq=function(e){return o[e]},e)for(var t=0;t<e.length;t++){var r=n.data(e[t],"__nicescroll")||!1;r&&(this[this.length]=r,this.length++)}return this};!function(e,o,t){for(var r=0,i=o.length;r<i;r++)t(e,o[r])}(z.prototype,["show","hide","toggle","onResize","resize","remove","stop","doScrollPos"],function(e,o){e[o]=function(){var e=arguments;return this.each(function(){this[o].apply(this,e)})}}),e.fn.getNiceScroll=function(e){return void 0===e?new z(this):this[e]&&n.data(this[e],"__nicescroll")||!1},(e.expr.pseudos||e.expr[":"]).nicescroll=function(e){return void 0!==n.data(e,"__nicescroll")},n.fn.niceScroll=function(e,o){void 0!==o||"object"!=typeof e||"jquery"in e||(o=e,e=!1);var t=new z;return this.each(function(){var r=n(this),i=n.extend({},o);if(e){var s=n(e);i.doc=s.length>1?n(e,r):s,i.win=r}!("doc"in i)||"win"in i||(i.win=r);var l=r.data("__nicescroll")||!1;l||(i.doc=i.doc||r,l=new b(i,r),r.data("__nicescroll",l)),t.push(l)}),1===t.length?t[0]:t},a.NiceScroll={getjQuery:function(){return e}},n.nicescroll||(n.nicescroll=new z,n.nicescroll.options=g)});