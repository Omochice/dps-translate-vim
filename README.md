
# dps-translate-vim

The translate plugin for Vim/Neovim using [denops.vim](https://github.com/vim-denops/denops.vim).

Respect for [skanehira/translate.vim](https://github.com/skanehira/translate.vim).

## Install

This plugin is depends on [denops.vim](https://github.com/vim-denops/denops.vim).

- `vim-plug`
    ```vim
    Plug 'vim-denops/denops.vim'
    Plug 'Omochice/dps-translate-vim'
    ```
- `dein.vim`
    ```vim
    call dein#add("vim-denops/denops.vim")
    call dein#add("Omochice/dps-translate-vim")
    ```

## Usage

- Set `g:dps_translate_source` and `g:dps_translate_target`
    ```vim
    let g:dps_translate_source = "en"
    let g:dps_translate_target = "ja"
    ```

- Run `:Translate` on Normal mode, The result of translation is shown.

![on_normal_mode](https://i.gyazo.com/0b3fe58f06e2a9c2c97da42d7dd6c87d.gif)


- Run `:Translate!` can translate reverse.

![on_normal_mode_reverse](https://i.gyazo.com/b73bfcba35e6005e81f8c319724241c2.gif)

- Can give a sentence as an argument also.
    ```vim
    :Translate <sentence>
    ```

- In visual mode, can select row and translate it.

![on_visual_mode](https://i.gyazo.com/2850c0c785a99134f5f1f49ccb2df462.gif)

- If you want to translate multiple sentences as one sentence, Use `TranslateJoin`.

![Join](https://i.gyazo.com/7a3a477763de36d4fc754b9556bd8ffe.gif)

## VARIABLES

- `g:dps_translate_source`
	The string of translation source language.
	Default: `'en'`

- `g:dps_translate_target`
	The string of translation source language.
	Default: `'ja'`

- `g:dps_translate_engine`
	Use engine.
	Default: `'google'`

- `g:dps_translate_deepl_token`
	Token for using deepl.
	Default: None

- `g:dps_translate_deepl_is_pro`
	Either pro plan or free plan.
	Default: `v:false`

- `g:dps_translate_border`
	Dict for border like:
    ```vim
	let g:dps_translate_border = {
	    \ 'topLeft': '┌',
	    \ 'top':  '─',
	    \ 'topRight': '┐',
	    \ 'left': '│',
	    \ 'right': '│',
	    \ 'bottomLeft': '└',
	    \ 'bottom':  '─',
	    \ 'bottomRight': '┘',
	    \ }
    ```
	Default: `'none'` (no border)

## LICENSE

MIT
