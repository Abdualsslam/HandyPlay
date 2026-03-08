// =============================================
// LOCALIZATION SYSTEM (i18n)
// =============================================
var LANG = 'ar'; // Default language: Arabic

var STRINGS = {
    ar: {
        // Menu
        choose_mode: 'اختر وضع اللعب',
        singleplayer: '— فردي —',
        multiplayer: '— جماعي —',
        fun: '— مرح —',
        instructions_cursor: '☝️ حرّك المؤشر بالسبابة   🤏 اضغط بالإبهام والسبابة للنقر',
        instructions_detail: 'الرسم/الذكاء: أشِر للرسم · افتح اليد للمسح   |   التصويب: صوّب واضغط   |   الفرقة: مرّر واضغط',
        menu: 'القائمة',

        // Game Names
        fruit_ninja: 'فاكهة النينجا',
        target_shooter: 'إصابة الهدف',
        drawing: 'الرسم الحر',
        ai_guess: 'تخمين الذكاء',
        tic_tac_toe: 'إكس أو',
        pictionary: 'ارسم وخمّن',
        air_band: 'الفرقة الهوائية',
        pong: 'بونغ',
        baby_face: 'وجه بيبي',

        // Game Descriptions
        desc_fruit_ninja: 'اقطع الفواكه بيدك وتجنب القنابل!',
        desc_target_shooter: 'صوّب على الأهداف واضغط لإصابتها',
        desc_drawing: 'ارسم بحرية باستخدام إصبعك في الهواء',
        desc_ai_guess: 'ارسم الشكل ودع الذكاء الاصطناعي يخمّنه',
        desc_tic_tac_toe: 'العب إكس أو مع صديقك بالإيماءات',
        desc_pictionary: 'ارسم الكلمة ودع الآخرين يخمّنونها',
        desc_air_band: 'اعزف على آلات موسيقية افتراضية بيديك',
        desc_pong: 'العب بونغ مع صديقك بتحريك المضرب بيدك',
        desc_baby_face: 'حوّل وجهك إلى وجه بيبي لطيف!',

        // Top Bar Labels
        topbar_drawing: '✏️ وضع الرسم',
        topbar_menu: '🎮 قائمة الألعاب',
        topbar_fruit_ninja: '🍎 فاكهة النينجا',
        topbar_tic_tac_toe: '⚔️ إكس أو',
        topbar_target_shooter: '🎯 إصابة الهدف',
        topbar_pictionary: '🎨 ارسم وخمّن',
        topbar_ai_draw: '🧠 تخمين الذكاء',
        topbar_air_band: '🎵 الفرقة الهوائية',
        topbar_pong: '🏓 بونغ',
        topbar_baby_face: '👶 وجه بيبي',

        // Common Game Text
        game_over: 'انتهت اللعبة!',
        score: 'النتيجة: ',
        play_again: 'العب مرة أخرى',
        get_ready: 'استعد!',
        level: 'المستوى ',

        // Fruit Ninja
        // (score uses emoji prefix, no text needed)

        // Target Shooter
        aim_pinch: 'صوّب واضغط!',
        targets_hit: 'الأهداف: ',
        best_combo: 'أفضل سلسلة: ',

        // AI Draw
        ai_title: '🧠 ارسم وخمّن بالذكاء',
        ai_subtitle: 'ارسم الشكل المطلوب ودع الذكاء الاصطناعي يخمّنه!',
        ai_instr_draw: '☝️ أشِر بالسبابة = ارسم',
        ai_instr_erase: '✋ افتح اليد = ممحاة (مؤشر أحمر)',
        ai_instr_clear: '🗑️ زر مسح لحذف كل شيء',
        ai_rounds_info: ' جولات · ',
        ai_seconds_each: ' ثوانٍ لكل جولة',
        start_game: 'ابدأ اللعبة',
        draw_prompt: 'ارسم: ',
        round: 'الجولة ',
        submit: 'تأكيد',
        clear: 'مسح',
        undo: 'تراجع',
        ai_thinking: '🤖 الذكاء يحلل...',
        ai_draw_hint: '☝️ أشِر للرسم  ·  ✋ افتح للمسح',
        ai_got_it: '🎉 الذكاء أصاب!',
        ai_guessed: 'خمّن الذكاء: ',
        you_drew: 'كنت ترسم: ',
        next_round: 'الجولة التالية',
        final_score: 'النتيجة النهائية: ',
        ai_correct_count: 'خمّن الذكاء بشكل صحيح ',
        ai_out_of: ' من ',
        ai_rounds_word: ' جولات',
        pts: ' نقطة',
        correct_mark: '✓',
        point_to_draw: '☝️ أشِر للرسم هنا',

        // Tic Tac Toe
        player_wins: 'اللاعب PLAYER فاز!',
        its_a_draw: 'تعادل!',
        player_turn: 'دور اللاعب PLAYER',

        // Pictionary
        pic_title: '🎨 ارسم وخمّن',
        pic_subtitle_1: 'لاعب يرسم والآخرون يخمّنون الكلمة!',
        pic_subtitle_2: 'الرسام سيرى الكلمة السرية.',
        pic_subtitle_3: 'المخمّنون ينادون بإجاباتهم!',
        start_round: 'ابدأ الجولة',
        memorize_word: 'أيها الرسام، احفظ هذه الكلمة:',
        starting_in: 'تبدأ في ',
        word_label: 'الكلمة:',
        show: 'إظهار',
        hide: 'إخفاء',
        correct_btn: 'صحيح!',
        correct_result: '🎉 صحيح!',
        times_up: '⏰ انتهى الوقت!',
        word_was: 'الكلمة كانت: ',
        new_round: 'جولة جديدة',

        // Air Band
        // Instrument names stay universal

        // Pong
        pong_player: 'اللاعب ',
        pong_wins: ' فاز! 🎉',
        pong_score_separator: ' — ',
        pong_serve: 'جاهز!',
        pong_two_hands: '✋✋ أظهر يديك للبدء',

        // Baby Face
        bf_no_face: '😊 أظهر وجهك للكاميرا!',
        bf_loading: '⏳ جاري تحميل فلتر الوجه...',

        // Language
        lang_toggle: '🌐 EN'
    },
    en: {
        // Menu
        choose_mode: 'Choose a Mode',
        singleplayer: '— SINGLEPLAYER —',
        multiplayer: '— MULTIPLAYER —',
        fun: '— FUN —',
        instructions_cursor: '☝️ Move cursor with index finger   🤏 Pinch Thumb + Index to click',
        instructions_detail: 'Drawing/AI: Point to draw · Open hand to erase   |   Target Shooter: Aim & Pinch   |   Air Band: Hover pad & Pinch',
        menu: 'Menu',

        // Game Names
        fruit_ninja: 'Fruit Ninja',
        target_shooter: 'Target Shooter',
        drawing: 'Drawing',
        ai_guess: 'AI Guess',
        tic_tac_toe: 'Tic-Tac-Toe',
        pictionary: 'Pictionary',
        air_band: 'Air Band',
        pong: 'Pong',
        baby_face: 'Baby Face',

        // Game Descriptions
        desc_fruit_ninja: 'Slash fruits with your hand, avoid bombs!',
        desc_target_shooter: 'Aim at targets and pinch to shoot',
        desc_drawing: 'Draw freely using your finger in the air',
        desc_ai_guess: 'Draw a shape and let AI guess it',
        desc_tic_tac_toe: 'Play X & O with a friend using gestures',
        desc_pictionary: 'Draw the word and let others guess it',
        desc_air_band: 'Play virtual instruments with your hands',
        desc_pong: 'Play Pong with a friend using hand gestures',
        desc_baby_face: 'Transform your face into a cute baby face!',

        // Top Bar Labels
        topbar_drawing: '✏️ Drawing Mode',
        topbar_menu: '🎮 Game Menu',
        topbar_fruit_ninja: '🍎 Fruit Ninja',
        topbar_tic_tac_toe: '⚔️ Tic-Tac-Toe',
        topbar_target_shooter: '🎯 Target Shooter',
        topbar_pictionary: '🎨 Pictionary',
        topbar_ai_draw: '🧠 AI Draw & Guess',
        topbar_air_band: '🎵 Air Band',
        topbar_pong: '🏓 Pong',
        topbar_baby_face: '👶 Baby Face',

        // Common Game Text
        game_over: 'Game Over!',
        score: 'Score: ',
        play_again: 'Play Again',
        get_ready: 'Get Ready!',
        level: 'Level ',

        // Target Shooter
        aim_pinch: 'Aim & Pinch!',
        targets_hit: 'Targets Hit: ',
        best_combo: 'Best Combo: ',

        // AI Draw
        ai_title: '🧠 AI Draw & Guess',
        ai_subtitle: 'Draw the shape shown, and the AI will guess it!',
        ai_instr_draw: '☝️ Point with index finger = Draw',
        ai_instr_erase: '✋ Open hand = Eraser (red cursor)',
        ai_instr_clear: '🗑️ Clear button to erase everything',
        ai_rounds_info: ' rounds · ',
        ai_seconds_each: ' seconds each',
        start_game: 'Start Game',
        draw_prompt: 'Draw: ',
        round: 'Round ',
        submit: 'Submit',
        clear: 'Clear',
        undo: 'Undo',
        ai_thinking: '🤖 AI Thinking...',
        ai_draw_hint: '☝️ Point to draw  ·  ✋ Open hand to erase',
        ai_got_it: '🎉 AI Got It!',
        ai_guessed: 'AI guessed: ',
        you_drew: 'You were drawing: ',
        next_round: 'Next Round',
        final_score: 'Final Score: ',
        ai_correct_count: 'AI guessed correctly ',
        ai_out_of: ' out of ',
        ai_rounds_word: ' rounds',
        pts: ' pts',
        correct_mark: '✓',
        point_to_draw: '☝️ Point to draw here',

        // Tic Tac Toe
        player_wins: 'Player PLAYER Wins!',
        its_a_draw: "It's a Draw!",
        player_turn: "Player PLAYER's Turn",

        // Pictionary
        pic_title: '🎨 Pictionary',
        pic_subtitle_1: 'One player draws, others guess the word!',
        pic_subtitle_2: 'The drawer will see the secret word.',
        pic_subtitle_3: 'Guessers shout out their answers!',
        start_round: 'Start Round',
        memorize_word: 'Drawer, memorize this word:',
        starting_in: 'Starting in ',
        word_label: 'Word:',
        show: 'Show',
        hide: 'Hide',
        correct_btn: 'Correct!',
        correct_result: '🎉 Correct!',
        times_up: "⏰ Time's Up!",
        word_was: 'The word was: ',
        new_round: 'New Round',

        // Pong
        pong_player: 'Player ',
        pong_wins: ' Wins! 🎉',
        pong_score_separator: ' — ',
        pong_serve: 'Ready!',
        pong_two_hands: '✋✋ Show both hands to start',

        // Baby Face
        bf_no_face: '😊 Show your face to the camera!',
        bf_loading: '⏳ Loading face filter...',

        // Language
        lang_toggle: '🌐 عربي'
    }
};

function t(key) {
    return (STRINGS[LANG] && STRINGS[LANG][key]) || (STRINGS['en'] && STRINGS['en'][key]) || key;
}

function toggleLang() {
    LANG = LANG === 'ar' ? 'en' : 'ar';
}
