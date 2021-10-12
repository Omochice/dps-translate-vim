if exists('g:loaded_dps_translate_vim') && g:loaded_dps_translate_vim
  finish
endif

let g:loaded_dps_translate_vim = v:true

command! -bang -range -nargs=? Translate     call dps_translate_vim#call(['<bang>', <line1>, <line2>, v:false, <f-args>])
command! -bang -range -nargs=? TranslateJoin call dps_translate_vim#call(['<bang>', <line1>, <line2>, v:true,  <f-args>])
