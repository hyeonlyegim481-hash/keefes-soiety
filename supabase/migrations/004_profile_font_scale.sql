begin;

alter table public.profile_preferences
  drop constraint if exists profile_preferences_font_scale_check;

alter table public.profile_preferences
  add constraint profile_preferences_font_scale_check
  check (font_scale between 90 and 150 and font_scale % 5 = 0);

commit;