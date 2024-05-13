def extract_lang_map(wd_language_object, selected_languages):
    lang_map = {}
    if wd_language_object != None:
        for lang in selected_languages:
            if lang in wd_language_object:
                lang_map[lang] = wd_language_object[lang]
    return lang_map