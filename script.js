
// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const setupPanel = document.getElementById('setup-panel');
const questionsPanel = document.getElementById('questions-panel');
const previewPanel = document.getElementById('preview-panel');
const dynamicForm = document.getElementById('dynamic-form');
const startQuestionsBtn = document.getElementById('startQuestionsBtn');
const backToSetupBtn = document.getElementById('backToSetupBtn');
const generateBtn = document.getElementById('generateBtn');
const backToQuestionsBtn = document.getElementById('backToQuestionsBtn');
const printBtn = document.getElementById('printBtn');
const logoSelect = document.getElementById('logoSelect');
const handwrittenDocs = document.getElementById('handwrittenDocs');
const fileStatus = document.getElementById('file-status');
const loading = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');

// State
let state = {
    apiKey: localStorage.getItem('gemini_api_key') || '',
    school: 'aizumi',
    studentType: 'jh',
    season: 'spring',
    answers: {},
    complexValues: { strategies: {}, courses: [] },
    fileBase64: null,
    fileMimeType: null
};

// --- Config (Simulated from previous script) ---
const SUBJECTS = ['英語', '数学', '国語', '理科', '社会'];
const DEFAULT_STRATEGIES = ['基礎徹底', '標準強化', '応用・発展', '現状維持'];
const IMPRESSION_OPTIONS = ['得意', '苦手', '普通', '伸びしろ有'];

// Copied from script_new.js (Reference Project)
// Middle School (JH) Traits
const STUDENT_TRAITS_JH = [
    '家で全く勉強しない', '勉強のやり方がわからない', 'やる気はあるが行動が伴わない',
    '集中力が続かない', 'スマホ・ゲーム時間が長い', '部活が忙しい',
    'ケアレスミスが多い', 'テスト本番に弱い', '基礎基本が抜けている',
    '文章題・記述問題が苦手', '英語の単語が覚えられない', '計算が遅い・間違える',
    '国語の読解力が課題', '理社の暗記が苦手', '学校の授業についていけない',
    '基礎学力テストの点数を上げたい', '志望校が決まらない', '上位校を目指したい',
    '質問するのが苦手・内気', '真面目でコツコツ取り組める'
];

// High School (HS) Traits
const STUDENT_TRAITS_HS = [
    '大学入試の仕組みがわからない', '指定校推薦を狙いたい', '評定（内申）を上げたい',
    '共通テスト対策を始めたい', '国公立大学を目指したい', '難関私大を目指したい',
    '部活と勉強の両立が難しい', '予習・復習が追いつかない',
    '英語の文法・長文が急に難しくなった', '数学の進度が速すぎる', '古典・漢文が苦手',
    '理系科目が全くわからない', 'スマホ・SNSに時間を取られる',
    '勉強習慣が確立できていない', '赤点を回避したい', '模試の判定が上がらない',
    '質問するのが苦手', '計画的に学習できない'
];

// JH Curriculum Notes
const CURRICULUM_NOTES_JH = [
    '基礎学力テスト（実力テスト）対策重視', '定期テスト対策を最優先', '苦手単元を集中的に潰す',
    '前学年の内容から戻って復習', '学校の授業予習メイン', '応用・発展問題にチャレンジ',
    '英検対策を組み込む', '宿題は多めに出してほしい', '宿題は少なめで（無理なく）',
    '部活引退まではペースを落とす', '早めに受験カリキュラムに入りたい',
    '理社はグループ指導で効率よく', '自習室の利用を促す'
];

// HS Curriculum Notes
const CURRICULUM_NOTES_HS = [
    '学校の課題・予習のサポート中心', '定期考査（評定）対策重視', '共通テスト対策',
    '2次試験・私大一般入試対策', '推薦入試（小論文・面接）対策',
    '苦手科目ピンポイント指導', '得意科目を伸ばす', '英語・数学は個別でじっくり',
    '英検・資格利用入試対策', '基礎からの学び直し', '学習計画の管理をしてほしい',
    '部活引退後にスパートをかけたい'
];

const DESIGN_THEMES = {
    'navy': { name: '📘 スタンダード・ネイビー', main: '#003366', sub: '#0095d9', bg: '#fff' },
    'green': { name: '🌿 グロース・グリーン', main: '#2E7D32', sub: '#558B2F', bg: '#f9fdf0' },
    'red': { name: '🔥 パッション・レッド', main: '#B71C1C', sub: '#D32F2F', bg: '#fff5f5' },
    'gold': { name: '👑 プレミアム・ゴールド', main: '#333333', sub: '#D4AF37', bg: '#fff' },
    'sakura': { name: '🌸 サクラ・サクセス', main: '#C2185B', sub: '#E91E63', bg: '#fff0f5' }
};

// Storage Keys
const KEY_CUSTOM_TRAITS_JH = 'seasonal_custom_traits_jh';
const KEY_CUSTOM_TRAITS_HS = 'seasonal_custom_traits_hs';
const KEY_CUSTOM_NOTES_JH = 'seasonal_custom_notes_jh';
const KEY_CUSTOM_NOTES_HS = 'seasonal_custom_notes_hs';
const KEY_APP_STATE = 'seasonal_app_state_v1';

// Question definitions
const BASE_QUESTIONS = [
    { id: 'student_name', label: '生徒名（様なし）', type: 'text', placeholder: '例：徳島 次郎' },
    {
        type: 'row',
        id: 'seasonal_period_row',
        fields: [
            { id: 'period_start', label: '講習期間 (開始)', type: 'date' },
            { id: 'period_end', label: '講習期間 (終了)', type: 'date' }
        ]
    },
    {
        type: 'row',
        id: 'gap_analysis',
        fields: [
            { id: 'target_school', label: '志望校', type: 'text', placeholder: '例：城南高校 / 徳島大学' },
            { id: 'current_score', label: '直近の点数・偏差値・評定', type: 'text', placeholder: '例: 基礎学320点 / 偏差値55' }
        ]
    },
    { id: 'subject_strategies', label: '教科別指導方針 & 印象', type: 'strategy_selector' }
];

const PROPOSAL_QUESTIONS = [
    { id: 'proposal_courses', label: '（フォームで指定する場合）提案コース', type: 'proposal_builder' },
    { id: 'design_theme', label: 'デザインテーマ', type: 'select', options: Object.values(DESIGN_THEMES).map(t => t.name) }
];

const QUESTION_SETS = {
    jh: [
        ...BASE_QUESTIONS.slice(0, 1), // name
        { id: 'grade', label: '学年', type: 'select', options: ['中学1年生', '中学2年生', '中学3年生'] },
        ...BASE_QUESTIONS.slice(1), // rest of base
        { id: 'current_issues_checks', label: '生徒の特徴・性格・悩み (中学生)', type: 'checkbox_group', options: STUDENT_TRAITS_JH, storageKey: KEY_CUSTOM_TRAITS_JH },
        { id: 'current_issues', label: 'その他 気になる点（自由記述・AI指示）', type: 'textarea', placeholder: 'AIへの指示（厳しめに、等）や補足事項...' },
        ...PROPOSAL_QUESTIONS.slice(0, 1), // proposal builder
        { id: 'plan_curriculum_checks', label: '特記事項・カリキュラム要望', type: 'checkbox_group', options: CURRICULUM_NOTES_JH, storageKey: KEY_CUSTOM_NOTES_JH },
        ...PROPOSAL_QUESTIONS.slice(1) // theme
    ],
    hs: [
        ...BASE_QUESTIONS.slice(0, 1), // name
        { id: 'grade', label: '学年', type: 'select', options: ['高校1年生', '高校2年生', '高校3年生', '浪人生'] },
        ...BASE_QUESTIONS.slice(1), // rest of base
        { id: 'current_issues_checks', label: '生徒の特徴・性格・悩み (高校生)', type: 'checkbox_group', options: STUDENT_TRAITS_HS, storageKey: KEY_CUSTOM_TRAITS_HS },
        { id: 'mock_score_manual', label: '手元に成績表がない場合の点数入力 (高校生用)', type: 'mock_score_input' },
        { id: 'current_issues', label: 'その他 気になる点（自由記述・AI指示）', type: 'textarea', placeholder: 'AIへの指示（進路相談重視で、等）や補足事項...' },
        ...PROPOSAL_QUESTIONS.slice(0, 1), // proposal builder
        { id: 'plan_curriculum_checks', label: '特記事項・カリキュラム要望', type: 'checkbox_group', options: CURRICULUM_NOTES_HS, storageKey: KEY_CUSTOM_NOTES_HS },
        ...PROPOSAL_QUESTIONS.slice(1) // theme
    ]
};

// --- Initialization ---
if (state.apiKey) apiKeyInput.value = state.apiKey;

// Load Saved State
const savedState = localStorage.getItem(KEY_APP_STATE);
if (savedState) {
    try {
        const parsed = JSON.parse(savedState);
        // Migration: Handle old format (just answers) vs new format (answers + complexValues)
        if (parsed.answers) {
            state.answers = parsed.answers || {};
            state.complexValues = parsed.complexValues || { strategies: {}, courses: [] };
        } else {
            // Old format fallback
            state.answers = parsed || {};
        }
    } catch (e) {
        console.error('Failed to load saved state', e);
    }
}

// File Upload Handler (Multiple Support)
handwrittenDocs.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);

    // Clear old state for safety
    state.uploadedFiles = [];
    state.fileBase64 = null; // Legacy cleanup

    if (files.length > 0) {
        // Limit to 5 files (approx 4-5 pages as requested)
        const filesToProcess = files.slice(0, 5);

        try {
            const promises = filesToProcess.map(async (file) => {
                const base64 = await readFileAsBase64(file);
                const mimeType = file.type || guessMimeType(file.name);
                return { mimeType, data: base64 };
            });

            state.uploadedFiles = await Promise.all(promises);

            // Legacy support for single file logic (if any remains), though we will update generate function
            if (state.uploadedFiles.length > 0) {
                state.fileBase64 = state.uploadedFiles[0].data;
                state.fileMimeType = state.uploadedFiles[0].mimeType;
            }

            fileStatus.style.display = 'inline';
            fileStatus.textContent = `✓ 読込完了 (${state.uploadedFiles.length}ファイル)`;
        } catch (err) {
            alert('ファイル読み込みエラー');
            console.error(err);
        }
    } else {
        state.uploadedFiles = [];
        fileStatus.style.display = 'none';
    }
});

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result;
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
function guessMimeType(filename) {
    if (filename.endsWith('.pdf')) return 'application/pdf';
    return 'image/jpeg';
}

// Event Listeners
saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        state.apiKey = key;
        alert('API Key Saved');
    }
});

startQuestionsBtn.addEventListener('click', () => {
    if (!state.apiKey && !apiKeyInput.value.trim()) {
        alert('APIキーを入力してください');
        return;
    }
    if (!state.apiKey) state.apiKey = apiKeyInput.value.trim();

    const schoolRadio = document.querySelector('input[name="school"]:checked');
    const studentRadio = document.querySelector('input[name="studentType"]:checked');
    const seasonRadio = document.querySelector('input[name="season"]:checked');

    if (schoolRadio) state.school = schoolRadio.value;
    if (studentRadio) state.studentType = studentRadio.value;
    if (seasonRadio) state.season = seasonRadio.value;

    renderQuestions();
    setupPanel.classList.add('hidden');
    questionsPanel.classList.remove('hidden');
});

backToSetupBtn.addEventListener('click', () => {
    questionsPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
});

// Auto-Save Trigger
dynamicForm.addEventListener('change', () => {
    collectFormData();
    saveStateToStorage();
});
dynamicForm.addEventListener('input', () => {
    if (window.saveTimeout) clearTimeout(window.saveTimeout);
    window.saveTimeout = setTimeout(() => {
        collectFormData();
        saveStateToStorage();
    }, 1000);
});

function saveStateToStorage() {
    const dataToSave = {
        answers: state.answers,
        complexValues: state.complexValues
    };
    localStorage.setItem(KEY_APP_STATE, JSON.stringify(dataToSave));
}

// Clear Button
const clearBtn = document.createElement('button');
clearBtn.id = 'clearAllBtn';
clearBtn.className = 'secondary-btn';
clearBtn.style.background = '#ffdddd';
clearBtn.style.color = '#d00';
clearBtn.style.marginRight = 'auto'; // Push others to right
clearBtn.innerText = '入力を全てクリア';
clearBtn.onclick = () => {
    if (confirm('入力内容を全て消去しますか？（取り消せません）')) {
        state.answers = {};
        localStorage.removeItem(KEY_APP_STATE);
        renderQuestions();
    }
};

// Insert Clear Button into actions
const actionsDiv = questionsPanel.querySelector('.actions');
if (actionsDiv) {
    // Check if added already? No, this script runs once.
    // Insert at beginning
    actionsDiv.insertBefore(clearBtn, actionsDiv.firstChild);
    actionsDiv.style.display = 'flex'; // Ensure flexbox
    actionsDiv.style.gap = '10px';
}


generateBtn.addEventListener('click', async () => {
    collectFormData();

    // UI Loading
    document.querySelector('.actions').classList.add('hidden');
    const loadingText = loading.querySelector('p');
    if (loadingText) loadingText.textContent = "AIモデルを探索中...";
    loading.classList.remove('hidden');

    try {
        const json = await generateProposalWithGemini(loadingText);
        const html = generateB4HTML(state, json);
        resultContainer.innerHTML = html;

        questionsPanel.classList.add('hidden');
        previewPanel.classList.remove('hidden');

    } catch (e) {
        alert('生成エラー: ' + e.message);
        console.error(e);
    } finally {
        document.querySelector('.actions').classList.remove('hidden');
        loading.classList.add('hidden');
    }
});

backToQuestionsBtn.addEventListener('click', () => {
    previewPanel.classList.add('hidden');
    questionsPanel.classList.remove('hidden');
});

printBtn.addEventListener('click', () => {
    if (!resultContainer.innerHTML) return;
    const win = window.open('', '_blank');
    const content = resultContainer.innerHTML;

    win.document.write(`
        <!DOCTYPE html>
        <html lang="ja">
        <head>
            <meta charset="UTF-8">
            <title>印刷プレビュー</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet">
            <style>
                @page { size: B4 landscape; margin: 0; }
                body { margin: 0; padding: 0; background: #ccc; display: flex; justify-content: center; min-height: 100vh; }
                /* Reset sheet container margins for print */
                @media print {
                    body { background: none; display: block; }
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    // setTimeout(() => win.print(), 500); // Optional auto print
});

// --- Rendering Logic ---
function renderQuestions() {
    dynamicForm.innerHTML = '';
    const qs = QUESTION_SETS[state.studentType];
    qs.forEach(q => {
        if (q.type === 'row') {
            const row = document.createElement('div');
            row.className = 'row-group';
            row.style.display = 'flex'; row.style.gap = '15px';
            q.fields.forEach(f => renderField(f, row));
            dynamicForm.appendChild(row);
        } else {
            renderField(q, dynamicForm);
        }
    });
}

const MOCK_EXAM_SUBJECTS = {
    common: [
        '英語(R)', '英語(L)',
        '数学IA', '数学IIBC', '情報I',
        '国語',
        '物理', '化学', '生物', '地学',
        '物理基礎', '化学基礎', '生物基礎', '地学基礎',
        '日本史', '世界史', '地理',
        '公共,倫理', '公共,政経'
    ],
    desc: [
        '英語',
        '数学(理系/III)', '数学(文系)',
        '国語(現古漢)',
        '物理', '化学', '生物', '地学',
        '日本史', '世界史', '地理',
        '小論文'
    ]
};

function renderField(q, container) {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.dataset.id = q.id;
    div.dataset.type = q.type;
    div.style.flex = '1';

    const lbl = document.createElement('label');
    lbl.textContent = q.label;
    div.appendChild(lbl);

    if (q.type === 'text' || q.type === 'number' || q.type === 'date') {
        const inp = document.createElement('input');
        inp.type = q.type;
        if (q.placeholder) inp.placeholder = q.placeholder;
        if (state.answers[q.id]) inp.value = state.answers[q.id];
        div.appendChild(inp);
    } else if (q.type === 'textarea') {
        const txt = document.createElement('textarea');
        txt.rows = 4;
        txt.placeholder = q.placeholder || '';
        if (state.answers[q.id]) txt.value = state.answers[q.id];
        div.appendChild(txt);
    } else if (q.type === 'select') {
        const sel = document.createElement('select');
        q.options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o; opt.textContent = o;
            sel.appendChild(opt);
        });
        if (state.answers[q.id]) sel.value = state.answers[q.id];
        div.appendChild(sel);
    } else if (q.type === 'strategy_selector') {
        renderStrategySelector(div);
    } else if (q.type === 'proposal_builder') {
        renderProposalBuilder(div);
    } else if (q.type === 'checkbox_group') {
        renderCheckboxGroup(div, q);
    } else if (q.type === 'mock_score_input') {
        renderMockScoreInput(div);
    }

    container.appendChild(div);
}

function renderMockScoreInput(container) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '15px';
    wrapper.style.padding = '15px';
    wrapper.style.background = 'rgba(255, 255, 255, 0.05)'; // Dark theme transparent bg
    wrapper.style.border = '1px solid #333';
    wrapper.style.borderRadius = '8px';

    // Helper to create grid
    const createGrid = (title, subjects, keyPrefix) => {
        const section = document.createElement('div');
        const h4 = document.createElement('h4');
        h4.textContent = title;
        h4.style.margin = '0 0 5px 0';
        h4.style.fontSize = '0.9rem';
        section.appendChild(h4);

        const grid = document.createElement('div');
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(130px, 1fr))';
        grid.style.gap = '8px';

        subjects.forEach(sub => {
            const cell = document.createElement('div');
            const label = document.createElement('div');
            label.textContent = sub;
            label.style.fontSize = '0.75rem';
            label.style.marginBottom = '2px';

            const input = document.createElement('input');
            input.type = 'number';
            input.placeholder = '点数';
            input.style.width = '100%';
            input.style.fontSize = '0.9rem';
            input.style.fontFamily = 'monospace';
            input.style.imeMode = 'disabled';
            input.dataset.key = `${keyPrefix}_${sub}`;
            input.className = 'mock-score-input';

            // Force dark styles explicitly if needed, though class should handle it
            input.style.background = '#000';
            input.style.color = '#fff';
            input.style.border = '1px solid #444';
            input.style.padding = '8px';
            input.style.borderRadius = '4px';

            // Restore val
            const savedKey = `${keyPrefix}_${sub}`;
            if (state.complexValues && state.complexValues.mockScores && state.complexValues.mockScores[savedKey]) {
                input.value = state.complexValues.mockScores[savedKey];
            }

            cell.appendChild(label);
            cell.appendChild(input);
            grid.appendChild(cell);
        });
        section.appendChild(grid);
        return section;
    };

    wrapper.appendChild(createGrid('共通テスト模試 (マーク・全科目)', MOCK_EXAM_SUBJECTS.common, 'mark'));
    wrapper.appendChild(createGrid('記述模試 (二次・私大)', MOCK_EXAM_SUBJECTS.desc, 'desc'));

    container.appendChild(wrapper);
}


function renderCheckboxGroup(container, q) {
    const wrapper = document.createElement('div');
    wrapper.className = 'checkbox-group-container';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    wrapper.style.gap = '8px';

    let customOptions = [];
    if (q.storageKey) customOptions = JSON.parse(localStorage.getItem(q.storageKey) || '[]');
    const allOptions = [...q.options, ...customOptions];
    const checkedValues = state.answers[q.id] ? state.answers[q.id].split('\n') : [];

    allOptions.forEach(opt => {
        const labelWrapper = document.createElement('label');
        labelWrapper.style.display = 'flex';
        labelWrapper.style.alignItems = 'center';
        labelWrapper.style.cursor = 'pointer';
        labelWrapper.style.fontSize = '0.9rem';
        labelWrapper.style.justifyContent = 'space-between'; // Space for delete btn
        labelWrapper.style.paddingRight = '5px';

        const leftSide = document.createElement('div');
        leftSide.style.display = 'flex';
        leftSide.style.alignItems = 'center';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = opt;
        cb.style.marginRight = '6px';
        if (checkedValues.includes(opt)) cb.checked = true;

        leftSide.appendChild(cb);
        leftSide.appendChild(document.createTextNode(opt));
        labelWrapper.appendChild(leftSide);

        // Delete button for custom options
        if (customOptions.includes(opt) && q.storageKey) {
            const delBtn = document.createElement('span');
            delBtn.textContent = '×';
            delBtn.className = 'delete-item-btn';
            delBtn.style.color = 'red';
            delBtn.style.fontWeight = 'bold';
            delBtn.style.marginLeft = '5px';
            delBtn.title = '削除';
            delBtn.onclick = (e) => {
                e.preventDefault();
                deleteCustomOption(q.storageKey, opt, () => renderQuestions());
            };
            labelWrapper.appendChild(delBtn);
        }

        wrapper.appendChild(labelWrapper);
    });

    container.appendChild(wrapper);

    if (q.storageKey) {
        // Add custom option UI
        const addDiv = document.createElement('div');
        addDiv.style.marginTop = '10px';
        const addInp = document.createElement('input');
        addInp.type = 'text';
        addInp.placeholder = '新しい選択肢を追加...';
        addInp.style.width = '70%';
        addInp.style.marginRight = '5px';
        const addBtn = document.createElement('button');
        addBtn.textContent = '追加';
        addBtn.className = 'secondary-btn';
        addBtn.style.padding = '5px 10px';
        addBtn.onclick = (e) => {
            e.preventDefault();
            const val = addInp.value.trim();
            if (val) {
                addCustomOption(q.storageKey, val, () => renderQuestions());
            }
        };
        addDiv.appendChild(addInp);
        addDiv.appendChild(addBtn);
        container.appendChild(addDiv);
    }
}

function addCustomOption(key, value, callback) {
    let opts = JSON.parse(localStorage.getItem(key) || '[]');
    if (!opts.includes(value)) {
        opts.push(value);
        localStorage.setItem(key, JSON.stringify(opts));
        callback();
    }
}

function deleteCustomOption(key, value, callback) {
    if (confirm(`「${value}」を削除しますか？`)) {
        let opts = JSON.parse(localStorage.getItem(key) || '[]');
        opts = opts.filter(o => o !== value);
        localStorage.setItem(key, JSON.stringify(opts));
        callback();
    }
}


function renderStrategySelector(container) {
    const wrapper = document.createElement('div');
    const strategies = (state.complexValues && state.complexValues.strategies) || {};

    SUBJECTS.forEach(sub => {
        const row = document.createElement('div');
        row.style.display = 'flex'; row.style.gap = '5px'; row.style.marginBottom = '5px'; row.style.alignItems = 'center';
        row.className = 'strategy-row';
        row.dataset.subject = sub;

        const name = document.createElement('span');
        name.style.width = '35px'; name.style.fontWeight = 'bold'; name.innerText = sub;
        name.className = 'strategy-subject';

        const sSel = document.createElement('select');
        sSel.className = 'strategy-select';
        sSel.style.flex = '1';
        sSel.innerHTML = '<option value="">方針...</option>' + DEFAULT_STRATEGIES.map(s => `<option value="${s}">${s}</option>`).join('');
        if (strategies[sub] && strategies[sub].policy) sSel.value = strategies[sub].policy;

        const iSel = document.createElement('select');
        iSel.className = 'impression-select';
        iSel.style.flex = '1';
        iSel.innerHTML = '<option value="">印象...</option>' + IMPRESSION_OPTIONS.map(i => `<option value="${i}">${i}</option>`).join('');
        if (strategies[sub] && strategies[sub].impression) iSel.value = strategies[sub].impression;

        row.appendChild(name); row.appendChild(sSel); row.appendChild(iSel);
        container.appendChild(row);
    });
    container.appendChild(wrapper);
}

function renderProposalBuilder(container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'proposal-builder';
    const list = document.createElement('div');
    list.className = 'proposal-list';

    // Restore logic
    let courses = (state.complexValues && state.complexValues.courses) || [];

    // Default rows if empty
    if (courses.length === 0) {
        courses = [
            { subject: '英語', type: '個別', freq: '', custom: '' },
            { subject: '数学', type: '個別', freq: '', custom: '' }
        ];
    }

    // Function to render a single row
    const addRow = (initialData = {}) => {
        const row = document.createElement('div');
        row.className = 'proposal-row';
        row.style.display = 'flex';
        row.style.gap = '10px'; // Increased gap slightly
        row.style.marginBottom = '5px';
        row.style.alignItems = 'center';

        // Subject Container (Holds both Select and Input to keep layout stable)
        const subContainer = document.createElement('div');
        subContainer.style.position = 'relative';
        subContainer.style.width = '150px'; // Fixed width column for Subject

        // Subject Select
        const sSelect = document.createElement('select');
        sSelect.className = 'p-sub';
        sSelect.style.width = '100%';
        const options = ['英語', '数学', '国語', '理科', '社会', '英検', 'その他'];
        options.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.text = s;
            if (initialData.subject === s) opt.selected = true;
            sSelect.appendChild(opt);
        });

        // Custom Subject Input
        const customInput = document.createElement('input');
        customInput.className = 'p-custom-sub';
        customInput.type = 'text';
        customInput.placeholder = '科目名入力...';
        customInput.style.width = '100%';
        if (initialData.custom) customInput.value = initialData.custom;

        // Toggle Logic
        const updateDisplay = () => {
            if (initialData.subject === 'その他' || sSelect.value === 'その他') {
                sSelect.style.display = 'none';
                customInput.style.display = 'block';
            } else {
                sSelect.style.display = 'block';
                customInput.style.display = 'none';
            }
        };

        // Initial State
        updateDisplay();

        // Events
        sSelect.addEventListener('change', () => {
            if (sSelect.value === 'その他') {
                sSelect.style.display = 'none';
                customInput.style.display = 'block';
                customInput.focus();
            }
        });

        // Revert to dropdown if empty on blur
        customInput.addEventListener('blur', () => {
            if (!customInput.value.trim()) {
                sSelect.value = '英語'; // Reset to default or keep previous valid? Default safer.
                sSelect.style.display = 'block';
                customInput.style.display = 'none';
            }
        });

        subContainer.appendChild(sSelect);
        subContainer.appendChild(customInput);

        // Type Select
        const tSelect = document.createElement('select');
        tSelect.className = 'p-type';
        tSelect.style.width = '100px'; // Fixed width
        tSelect.style.flex = 'none';
        ['個別', '映像'].forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.text = t;
            if (initialData.type === t) opt.selected = true;
            tSelect.appendChild(opt);
        });

        // Freq Input
        const fInput = document.createElement('input');
        fInput.type = 'number';
        fInput.className = 'p-freq';
        fInput.placeholder = 'コマ';
        fInput.style.width = '100px'; // Fixed width
        fInput.style.flex = 'none';   // Don't grow unnecessarily
        fInput.style.imeMode = 'disabled';
        if (initialData.freq) fInput.value = initialData.freq;

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.innerText = '×';
        delBtn.style.background = '#faa'; delBtn.style.border = 'none'; delBtn.style.borderRadius = '4px';
        delBtn.style.color = 'white';
        delBtn.style.width = '30px';
        delBtn.style.cursor = 'pointer';
        delBtn.onclick = () => row.remove();

        row.appendChild(subContainer);
        row.appendChild(tSelect);
        row.appendChild(fInput);
        row.appendChild(delBtn);
        list.appendChild(row);
    };

    // Restore existing courses
    courses.forEach(c => addRow(c));

    const addBtn = document.createElement('button');
    addBtn.innerText = '+ 追加';
    addBtn.className = 'secondary-btn';
    addBtn.style.padding = '5px 10px';
    addBtn.style.marginTop = '5px';
    addBtn.onclick = (e) => {
        e.preventDefault();
        addRow({ subject: '英語', type: '個別', freq: '' });
    };

    wrapper.appendChild(list);
    wrapper.appendChild(addBtn);
    container.appendChild(wrapper);
}

function collectFormData() {
    state.answers = state.answers || {};
    state.complexValues = { strategies: {}, courses: [] }; // Reset complex to rebuild

    const groups = dynamicForm.querySelectorAll('.form-group');
    groups.forEach(g => {
        const id = g.dataset.id;
        const type = g.dataset.type;
        if (type === 'strategy_selector') {
            let strats = [];
            g.querySelectorAll('.strategy-row').forEach(r => {
                const sub = r.dataset.subject || r.querySelector('.strategy-subject').innerText;
                const st = r.querySelector('.strategy-select').value;
                const im = r.querySelector('.impression-select').value;

                if (st || im) {
                    let desc = `${sub}:`;
                    if (st) desc += ` 方針[${st}]`;
                    if (im) desc += ` 印象[${im}]`;
                    strats.push(desc);
                    state.complexValues.strategies[sub] = { policy: st, impression: im };
                }
            });
            state.answers[id] = strats.join(', ');
        } else if (type === 'proposal_builder') {
            let props = [];
            g.querySelectorAll('.proposal-row').forEach(r => {
                const sSelect = r.querySelector('.p-sub');
                let subject = sSelect.value;
                const customInput = r.querySelector('.p-custom-sub');
                let customVal = '';

                if (subject === 'その他') {
                    customVal = customInput.value;
                    subject = customVal || 'その他';
                }

                const t = r.querySelector('.p-type').value;
                const f = r.querySelector('.p-freq').value;

                if (f) { // Save if at least frequency is set, or default
                    props.push(`${subject} (${t}) ${f}コマ`);
                    // Save raw data for inputs
                    state.complexValues.courses.push({
                        subject: sSelect.value, // Save actual select value 'その他' or '英語' to restore select
                        custom: customVal,      // Save custom text
                        type: t,
                        freq: f
                    });
                }
            });
            state.answers[id] = props.join(', ');
        } else if (type === 'checkbox_group') {
            const checked = [];
            g.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => checked.push(cb.value));
            state.answers[id] = checked.join('\n');
        } else if (type === 'mock_score_input') {
            // Mock scores are collected globally below, just placeholder here if needed
        } else {
            const el = g.querySelector('input, textarea, select');
            if (el) state.answers[id] = el.value;
        }
    });

    // Collect Mock Scores (Global collection for simplicity)
    state.complexValues.mockScores = {};
    const mockInputs = document.querySelectorAll('.mock-score-input');
    mockInputs.forEach(inp => {
        if (inp.value) {
            state.complexValues.mockScores[inp.dataset.key] = inp.value;
        }
    });
}

// --- Dynamic Model Selection & API Call ---
async function generateProposalWithGemini(statusElement) {
    // 1. Dynamic Model Discovery
    let candidatesFromApi = [];
    try {
        if (statusElement) statusElement.textContent = "AIモデルリストを取得中...";
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${state.apiKey}`;
        const listRes = await fetch(listUrl);

        if (listRes.ok) {
            const listData = await listRes.json();
            const models = listData.models || [];

            // GenerateContent Support Check
            const availableModels = models.filter(m =>
                m.supportedGenerationMethods &&
                m.supportedGenerationMethods.includes("generateContent") &&
                m.name.includes("gemini")
            );

            let allNames = availableModels.map(m => m.name.replace("models/", ""));

            // White List Logic (Strict)
            const ALLOWED_SERIES = [
                'gemini-1.5-pro', 'gemini-1.5-flash',
                'gemini-2.0-pro', 'gemini-2.0-flash',
                'gemini-2.5-pro', 'gemini-2.5-flash',
                'gemini-3.0-pro', 'gemini-3.0-flash',
                'gemini-3-pro', 'gemini-3-flash'
            ];

            allNames = allNames.filter(n => {
                if (n.includes('computer-use')) return false;
                if (n.includes('robotics')) return false;
                if (n.includes('image-generation')) return false;
                if (n.includes('image-preview')) return false;
                if (n.includes('tts')) return false;
                return ALLOWED_SERIES.some(series => n.includes(series));
            });

            // Scoring Sort
            allNames.sort((a, b) => {
                const getScore = (name) => {
                    let score = 0;
                    if (name.includes("gemini-3")) score += 300;
                    else if (name.includes("gemini-2.5")) score += 200;
                    else if (name.includes("gemini-2.0")) score += 100;
                    else if (name.includes("gemini-1.5")) score += 50;

                    if (name.includes("pro")) score += 20;
                    if (name.includes("flash")) score += 10;
                    if (name.includes("latest")) score += 5;
                    if (name.includes("exp")) score += 1;
                    return score;
                };
                return getScore(b) - getScore(a);
            });
            candidatesFromApi = allNames;
            console.log("Auto-discovered models:", candidatesFromApi);
        }
    } catch (e) {
        console.warn("Discovery failed", e);
    }

    let modelCandidates = [];
    if (candidatesFromApi.length > 0) {
        modelCandidates = candidatesFromApi;
    } else {
        // Fallback
        modelCandidates = ["gemini-1.5-pro", "gemini-1.5-flash"];
    }

    // 2. Generation Loop
    let finalResponseData = null;
    let lastError = null;

    // Build Prompt & Content
    const formDataStr = JSON.stringify(state.answers, null, 2);
    let userPrompt = `
【ユーザー入力情報】
${formDataStr}

`;

    // Add Manual Mock Scores to Prompt
    if (state.complexValues && state.complexValues.mockScores && Object.keys(state.complexValues.mockScores).length > 0) {
        const scores = state.complexValues.mockScores;
        let scoreStr = "【模試手動入力データ (分析・弱点把握の参考にしてください)】\n";
        for (const [key, val] of Object.entries(scores)) {
            // key is like mark_英語(R) or desc_数学(III)
            const [type, sub] = key.split('_');
            const typeLabel = type === 'mark' ? '共通テスト模試' : '記述模試';
            scoreStr += `- ${typeLabel} [${sub}]: ${val}点\n`;
        }
        userPrompt += scoreStr + "\n";
    }

    userPrompt += `
【指示】
上記の情報に基づき、ECC Best Oneの季節講習提案書の内容（JSON）を作成してください。
徳島県の入試事情を考慮し、SEASONAL_GUIDEの内容を反映してください。
`;

    if (state.uploadedFiles && state.uploadedFiles.length > 0) {
        userPrompt += `
\n【追加資料: 模試成績表または手書きメモ】
添付された画像/PDF（最大5枚）を参照してください。
これらが「模試の成績表」である場合、各科目の偏差値や得点を読み取り、現状分析（analysis）に反映させてください。
これらが「手書きの提案メモ」である場合、記載された単元やコマ数を提案プラン（plan）に反映してください。
`;
    } else if (state.fileBase64) {
        // Fallback for legacy state if uploadedFiles is missing but base64 exists
        userPrompt += `
\n【追加資料: 参考画像】
添付画像を参照してください。
`;
    }

    const parts = [
        { text: SYSTEM_PROMPT + "\n\n" + SEASONAL_GUIDE },
        { text: userPrompt }
    ];

    if (state.uploadedFiles && state.uploadedFiles.length > 0) {
        state.uploadedFiles.forEach(file => {
            parts.push({
                inline_data: {
                    mime_type: file.mimeType,
                    data: file.data
                }
            });
        });
    } else if (state.fileBase64) {
        parts.push({
            inline_data: {
                mime_type: state.fileMimeType,
                data: state.fileBase64
            }
        });
    }

    for (const modelName of modelCandidates) {
        if (statusElement) statusElement.textContent = `生成中... (${modelName})`;
        console.log(`Trying Model: ${modelName}`);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${state.apiKey}`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: parts }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: { message: res.statusText } }));
                console.warn(`Failed with ${modelName}:`, errData);
                // If quota exceeded (429) or not found (404), try next.
                lastError = new Error(`[${modelName}] ${errData.error?.message || res.status}`);
                continue;
            }

            finalResponseData = await res.json();
            console.log(`Success with ${modelName}`);
            break; // Success!

        } catch (e) {
            console.warn(`Network error with ${modelName}:`, e);
            lastError = e;
        }
    }

    if (!finalResponseData) {
        throw new Error(lastError ? lastError.message : "All models failed.");
    }

    // 3. Parse JSON
    let rawText = finalResponseData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("No content returned.");

    // Simple Cleanup just in case
    let text = rawText.replace(/```json/g, '').replace(/```/g, '');
    const firstOpen = text.indexOf('{');
    const lastClose = text.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
        text = text.substring(firstOpen, lastClose + 1);
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        try {
            return JSON.parse(text.trim());
        } catch (e2) {
            console.error("JSON Parse Error", rawText);
            throw new Error("AIデータの解析に失敗しました(JSON Error)");
        }
    }
}

// --- HTML Generator ---
function safeRender(content) {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) return content.map(c => safeRender(c)).join('');
    return String(content);
}

function generateB4HTML(state, data) {
    const schoolName = state.school === 'kitajima' ? 'ECCベストワン 北島中央校' : 'ECCベストワン 藍住校';

    // Theme Logic
    let themeKey = 'navy';
    if (state.answers.design_theme) {
        const found = Object.values(DESIGN_THEMES).find(t => t.name === state.answers.design_theme);
        if (found) {
            themeKey = Object.keys(DESIGN_THEMES).find(k => DESIGN_THEMES[k].name === state.answers.design_theme) || 'navy';
        }
    }
    const theme = DESIGN_THEMES[themeKey];

    const cssVars = `
        --c-main: ${theme.main};
        --c-sub: ${theme.sub};
        --c-bg: ${theme.bg};
        --c-text: #333;
    `;

    const today = new Date();
    const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

    // Note: We use a class .sheet for the page container to avoid messing up the app's body when previewing.
    return `
    <style>
        :root { ${cssVars} }
        /* Reset for the sheet */
        .sheet-container {
            font-family: 'Noto Serif JP', serif;
            background: var(--c-bg); color: var(--c-text);
            box-sizing: border-box; 
            width: 364mm; height: 257mm; /* B4 Landscape Exact */
            padding: 10mm;
            margin: 0 auto; /* Center in preview */
            overflow: hidden; /* Strict single page */
            display: grid; 
            gap: 8px;
            grid-template-rows: 40px auto 1fr 35mm; /* Fixed header, intro, flexible main, fixed roadmap height */
            position: relative;
            border: 1px solid #ccc; /* Border for preview visibility */
        }
        @media print {
            .sheet-container {
                border: none;
                margin: 0;
                page-break-after: always;
            }
            body { margin: 0; padding: 0; }
        }

        .sheet-container h1, .sheet-container h2, .sheet-container h3, .sheet-container p, .sheet-container ul, .sheet-container li { margin: 0; padding: 0; }
        .sheet-container ul { padding-left: 1.2em; }
        .sheet-container strong { font-weight: bold; color: var(--c-main); }
        
        .header-area { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid var(--c-main); padding-bottom: 5px; height: 100%; box-sizing: border-box; }
        .header-title { font-size: 18pt; font-weight: bold; color: var(--c-main); line-height: 1; }
        
        .intro-area { font-size: 9pt; line-height: 1.3; }
        
        .main-grid { display: grid; grid-template-columns: 28% 48% 22%; gap: 8px; overflow: hidden; height: 100%; }
        .col { display: flex; flex-direction: column; gap: 8px; height: 100%; }
        
        .box { border: 1px solid var(--c-sub); border-radius: 6px; background: #fff; display: flex; flex-direction: column; overflow: hidden; }
        .box-header { background: var(--c-main); color: #fff; font-family: 'Noto Sans JP'; font-weight: bold; font-size: 10pt; padding: 2px 10px; }
        .box-content { padding: 6px; font-size: 8.5pt; line-height: 1.35; flex: 1; overflow-y: hidden; } /* Hide overflow to force fit */
        
        .schedule-box .box-header { background: #666; } .schedule-box { border-color: #666; }
        .message-box .box-header { background: #f08c00; } .message-box { border-color: #f08c00; }
        
        .roadmap-box { 
            border: 2px solid #008a00; border-radius: 6px; padding: 5px; 
            display: flex; flex-direction: column; 
            background: #fff; 
            height: 100%; box-sizing: border-box;
            overflow: hidden;
        }
        .roadmap-header { 
            background: #008a00; color: #fff; font-size: 9pt; font-weight: bold; 
            padding: 2px 8px; border-radius: 4px; width: fit-content; margin-bottom: 4px; 
        }
        
        /* Roadmap Horizontal Layout */
        .roadmap-container {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            width: 100%;
            height: 100%;
            align-items: stretch;
        }
        .roadmap-step {
            flex: 1;
            border: 1px solid #008a00;
            border-radius: 5px;
            padding: 4px;
            background: #f9fff9;
            display: flex;
            flex-direction: column;
            font-size: 8pt;
        }
        .step-date {
            background: #008a00; color: #fff; font-weight: bold; font-size: 0.8em;
            padding: 1px 4px; border-radius: 3px; display: inline-block; margin-bottom: 2px;
            align-self: flex-start;
        }
        .step-title {
            font-weight: bold; font-size: 0.9em; color: #008a00; margin-bottom: 2px;
            border-bottom: 1px dashed #ccc; padding-bottom: 1px;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .step-detail {
            font-size: 0.8em; color: #333; line-height: 1.2;
            overflow: hidden;
        }

    </style>
    <div class="sheet-container">
        <div class="header-area">
            <div>
                <div class="header-title">${safeRender(data.title)}</div>
                <div style="margin-top:2px; font-size:10pt;">${state.answers.student_name || '生徒'} 様 &nbsp; <span style="font-size:0.9em;">作成日: ${dateStr}</span></div>
            </div>
            <div style="text-align:right;">
                 <div style="font-size:12pt; font-weight:bold; color:#666; font-family:'Noto Sans JP';">${schoolName}</div>
            </div>
        </div>
        
        <div class="intro-area">${safeRender(data.intro)}</div>
        
        <div class="main-grid">
            <div class="col">
                <div class="box" style="flex:2;">
                    <div class="box-header">現状分析</div>
                    <div class="box-content">${safeRender(data.analysis)}</div>
                </div>
                 <div class="box" style="flex:1;">
                    <div class="box-header">目標設定</div>
                    <div class="box-content">${safeRender(data.goals)}</div>
                </div>
            </div>
            <div class="col">
                 <div class="box" style="height:100%;">
                    <div class="box-header">提案プラン</div>
                    <div class="box-content">${safeRender(data.plan)}</div>
                </div>
            </div>
            <div class="col">
                 <div class="box schedule-box" style="flex:1.5;">
                    <div class="box-header">スケジュール</div>
                    <div class="box-content">${safeRender(data.schedule)}</div>
                </div>
                 <div class="box message-box" style="flex:1;">
                    <div class="box-header">先生からのメッセージ</div>
                    <div class="box-content">${safeRender(data.message)}</div>
                </div>
            </div>
        </div>
        
        <div class="roadmap-box">
            <div class="roadmap-header">合格へのロードマップ</div>
            <div style="flex:1; overflow:hidden;">${safeRender(data.roadmap)}</div>
        </div>
    </div>
    `;
}

// Scroll To Top Logic
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
