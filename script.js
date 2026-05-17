    let mode = 'c'; // which side to solve for
    let history = [];

    const configs = {
        c: {
            inputs: [
                { id: 'valA', label: 'ΠΛΕΥΡΑ Α (α)', placeholder: 'π.χ. 3.00' },
                { id: 'valB', label: 'ΠΛΕΥΡΑ Β (β)', placeholder: 'π.χ. 4.00' }
            ],
            resultLabel: 'ΔΙΑΓΩΝΙΟΣ <em>γ (c)</em>',
            calc: (a, b) => Math.sqrt(a*a + b*b),
            histLabel: (a, b, r) => `α=${a} β=${b} → γ=${r}m`
        },
        a: {
            inputs: [
                { id: 'valC', label: 'ΥΠΟΤΕΙΝΟΥΣΑ γ (c)', placeholder: 'π.χ. 5.00' },
                { id: 'valB', label: 'ΠΛΕΥΡΑ Β (β)', placeholder: 'π.χ. 4.00' }
            ],
            resultLabel: 'ΠΛΕΥΡΑ <em>α (Α)</em>',
            calc: (c, b) => {
                const v = c*c - b*b;
                return v > 0 ? Math.sqrt(v) : null;
            },
            histLabel: (c, b, r) => `γ=${c} β=${b} → α=${r}m`
        },
        b: {
            inputs: [
                { id: 'valC', label: 'ΥΠΟΤΕΙΝΟΥΣΑ γ (c)', placeholder: 'π.χ. 5.00' },
                { id: 'valA', label: 'ΠΛΕΥΡΑ Α (α)', placeholder: 'π.χ. 3.00' }
            ],
            resultLabel: 'ΠΛΕΥΡΑ <em>β (Β)</em>',
            calc: (c, a) => {
                const v = c*c - a*a;
                return v > 0 ? Math.sqrt(v) : null;
            },
            histLabel: (c, a, r) => `γ=${c} α=${a} → β=${r}m`
        }
    };

    function setMode(m) {
        mode = m;
        ['c','a','b'].forEach(t => {
            document.getElementById('tab-'+t).classList.toggle('active', t === m);
        });
        renderInputs();
        calculate();
        updateTriangle();
    }

    function renderInputs() {
        const conf = configs[mode];
        const area = document.getElementById('inputs-area');
        area.innerHTML = conf.inputs.map(inp => `
            <div class="input-row">
                <label>${inp.label}</label>
                <div class="input-wrap">
                    <input type="number" inputmode="decimal" id="${inp.id}"
                        placeholder="${inp.placeholder}" oninput="calculate()" autocomplete="off">
                    <span class="input-unit">m</span>
                </div>
            </div>
        `).join('');
        document.getElementById('resultLabel').innerHTML = conf.resultLabel;
    }

    function getInputVals() {
        const conf = configs[mode];
        return conf.inputs.map(inp => parseFloat(document.getElementById(inp.id)?.value) || 0);
    }

    let historyTimer = null;

    function calculate() {
        const [v1, v2] = getInputVals();
        const conf = configs[mode];
        const rv = document.getElementById('resultValue');
        const rb = document.getElementById('resultBlock');

        if (v1 > 0 && v2 > 0) {
            const result = conf.calc(v1, v2);
            if (result === null || isNaN(result)) {
                rv.textContent = 'Σφάλμα';
                rv.classList.remove('active');
                rb.classList.remove('has-result');
            } else {
                rv.textContent = result.toFixed(3);
                rv.classList.add('active');
                rb.classList.add('has-result');
                // Debounce: καταγραφή μόνο αφού σταματήσει η πληκτρολόγηση (800ms)
                clearTimeout(historyTimer);
                historyTimer = setTimeout(() => {
                    pushHistory(conf.histLabel(
                        v1.toFixed(3), v2.toFixed(3), result.toFixed(3)
                    ));
                }, 800);
            }
        } else {
            rv.textContent = '—';
            rv.classList.remove('active');
            rb.classList.remove('has-result');
        }
    }

    function clearAll() {
        const conf = configs[mode];
        conf.inputs.forEach(inp => {
            const el = document.getElementById(inp.id);
            if (el) el.value = '';
        });
        document.getElementById('resultValue').textContent = '—';
        document.getElementById('resultValue').classList.remove('active');
        document.getElementById('resultBlock').classList.remove('has-result');
    }

    function copyResult() {
        const val = document.getElementById('resultValue').textContent;
        if (val === '—' || val === 'Σφάλμα') return;
        navigator.clipboard.writeText(val + ' m').then(() => showToast());
    }

    function showToast() {
        const t = document.getElementById('toast');
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 1800);
    }

    let lastHist = '';
    function pushHistory(text) {
        if (text === lastHist) return;
        lastHist = text;
        history.unshift(text);
        if (history.length > 8) history.pop();
        renderHistory();
    }

    function clearHistory() {
        history = [];
        lastHist = '';
        renderHistory();
    }

    function renderHistory() {
        const list = document.getElementById('historyList');
        if (!history.length) {
            list.innerHTML = '<div style="font-size:0.75em; color: var(--muted); font-family: Roboto Mono; padding: 8px 0;">Δεν υπάρχουν υπολογισμοί ακόμα.</div>';
            return;
        }
        list.innerHTML = history.map(h => {
            const parts = h.split('→');
            return `<div class="history-item">
                <span>${parts[0].trim()}</span>
                <span class="hi-result">→ ${parts[1].trim()}</span>
            </div>`;
        }).join('');
    }

    function updateTriangle() {
        // highlight the unknown side on triangle
        document.getElementById('lbl-a').className = 'label-a' + (mode === 'a' ? ' active' : '');
        document.getElementById('lbl-b').className = 'label-b' + (mode === 'b' ? ' active' : '');
        document.getElementById('lbl-c').className = 'label-c' + (mode === 'c' ? ' active' : '');
    }

    // Init
// Init
setMode('c');