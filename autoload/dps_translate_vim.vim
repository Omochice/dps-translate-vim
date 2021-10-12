function! dps_translate_vim#call(args) abort
  call denops#plugin#wait('translate')
  call denops#notify('translate', 'dpsTranslate', a:args)
endfunction
