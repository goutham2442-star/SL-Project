import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  BookOpen,
  CarFront,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Database,
  Eye,
  Gauge,
  GitBranch,
  History,
  Layers,
  Lightbulb,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const emptyForm = {
  brand: '',
  model: '',
  year: 2018,
  mileage: 40000,
  transmission: 'Automatic',
  fuelType: 'Diesel',
  tax: 150,
  mpg: 55,
  engineSize: 2.0,
};

function money(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

/* ───── Simple hash-based router ───── */
function useRoute() {
  const [page, setPage] = useState(window.location.hash || '#home');
  useEffect(() => {
    const handler = () => setPage(window.location.hash || '#home');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return page;
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════ */
function App() {
  const page = useRoute();

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <TopBar currentPage={page} />
      {page === '#how-it-works' ? <HowItWorksPage /> : <HomePage />}
      <footer>
        <span>CARVALUE</span>
        <span>Used Car Price Prediction · Linear Regression</span>
        <span>Built as a Supervised Learning project</span>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TOP BAR
   ═══════════════════════════════════════════════════════════ */
function TopBar({ currentPage }) {
  return (
    <header className="topbar">
      <a className="brand" href="#home">
        <span className="brand-mark"><CarFront size={20} /></span>
        <span>CAR<span>VALUE</span></span>
      </a>
      <nav>
        <a href="#predict" className={currentPage === '#home' || currentPage === '' ? 'nav-active' : ''}>Predict</a>
        <a href="#model">Model</a>
        <a href="#how-it-works" className={currentPage === '#how-it-works' ? 'nav-active' : ''}>How It Works</a>
        <a href="#workflow">Workflow</a>
      </nav>
      <div className="status-pill"><span /> ML model online</div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOME PAGE (prediction)
   ═══════════════════════════════════════════════════════════ */
function HomePage() {
  const [options, setOptions] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/options`).then((r) => r.json()),
      fetch(`${API}/api/metrics`).then((r) => r.json()),
    ])
      .then(([optionData, metricData]) => {
        setOptions(optionData);
        setMetrics(metricData);
        const firstBrand = optionData.brands?.[0] || '';
        const firstModel = optionData.models_by_brand?.[firstBrand]?.[0] || '';
        setForm((f) => ({ ...f, brand: firstBrand, model: firstModel }));
      })
      .catch(() => setError('Backend is not running. Start Flask on port 5000.'));
  }, []);

  const models = useMemo(() => {
    if (!options) return [];
    return options.models_by_brand?.[form.brand] || options.models || [];
  }, [options, form.brand]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    if (field === 'brand' && options) {
      const nextModels = options.models_by_brand?.[value] || [];
      setForm((current) => ({
        ...current,
        brand: value,
        model: nextModels[0] || '',
      }));
    }
  }

  async function predict(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Prediction failed');
      setResult(data);
      setHistory((items) => [
        {
          id: Date.now(),
          label: `${form.brand} ${form.model}`,
          year: form.year,
          price: data.predicted_price,
        },
        ...items,
      ].slice(0, 4));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    const brand = options?.brands?.[0] || '';
    const model = options?.models_by_brand?.[brand]?.[0] || '';
    setForm({ ...emptyForm, brand, model });
    setResult(null);
    setError('');
  }

  const resultPercent = result ? Math.round(result.r2 * 10000) / 100 : 0;

  return (
    <main id="top">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> SUPERVISED LEARNING PROJECT</div>
          <h1>Know what your<br /><em>car could be worth.</em></h1>
          <p>
            A Linear Regression model trained on 99,187 used-car records.
            Enter the car details and get an instant model-based price estimate.
          </p>
          <div className="hero-stats">
            <div><strong>99K+</strong><span>records</span></div>
            <div><strong>9</strong><span>features</span></div>
            <div><strong>{metrics ? `${(metrics.r2 * 100).toFixed(1)}%` : '—'}</strong><span>test R²</span></div>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="speed-lines" />
          <div className="car-glow" />
          <CarFront size={180} strokeWidth={1.1} />
          <div className="floating-tag tag-one"><Gauge size={15} /> Mileage matters</div>
          <div className="floating-tag tag-two"><TrendingUp size={15} /> Price estimate</div>
        </div>
      </section>

      {/* ── Predict ── */}
      <section id="predict" className="workspace">
        <div className="section-heading">
          <div>
            <span className="section-kicker">01 / PREDICT</span>
            <h2>Describe the car.</h2>
          </div>
          <button className="ghost-btn" onClick={reset}><RotateCcw size={16} /> Reset</button>
        </div>

        <div className="prediction-grid">
          <form className="form-card" onSubmit={predict}>
            <div className="form-grid">
              <Field label="Brand" required>
                <Select value={form.brand} onChange={(e) => update('brand', e.target.value)} options={options?.brands || []} />
              </Field>
              <Field label="Model" required>
                <Select value={form.model} onChange={(e) => update('model', e.target.value)} options={models} />
              </Field>
              <Field label="Year" required>
                <input type="number" min="1990" max="2025" value={form.year} onChange={(e) => update('year', Number(e.target.value))} />
              </Field>
              <Field label="Mileage (miles)" required>
                <input type="number" min="0" value={form.mileage} onChange={(e) => update('mileage', Number(e.target.value))} />
              </Field>
              <Field label="Engine size (L)" required>
                <input type="number" min="0.1" step="0.1" value={form.engineSize} onChange={(e) => update('engineSize', Number(e.target.value))} />
              </Field>
              <Field label="Tax (£)" required>
                <input type="number" min="0" value={form.tax} onChange={(e) => update('tax', Number(e.target.value))} />
              </Field>
              <Field label="MPG" required>
                <input type="number" min="1" step="0.1" value={form.mpg} onChange={(e) => update('mpg', Number(e.target.value))} />
              </Field>
            </div>

            {/* ── Transmission option cards ── */}
            <div className="option-group">
              <span className="option-group-label">Transmission</span>
              <div className="option-cards">
                {(options?.transmissions || ['Automatic', 'Manual', 'Semi-Auto', 'Other']).map((t) => (
                  <label
                    key={t}
                    className={`option-card${form.transmission === t ? ' option-card-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="transmission"
                      value={t}
                      checked={form.transmission === t}
                      onChange={() => update('transmission', t)}
                    />
                    <span className="option-check"><Check size={14} /></span>
                    <span className="option-label">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Fuel Type option cards ── */}
            <div className="option-group">
              <span className="option-group-label">Fuel Type</span>
              <div className="option-cards">
                {(options?.fuel_types || ['Diesel', 'Petrol', 'Hybrid', 'Electric', 'Other']).map((f) => (
                  <label
                    key={f}
                    className={`option-card${form.fuelType === f ? ' option-card-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="fuelType"
                      value={f}
                      checked={form.fuelType === f}
                      onChange={() => update('fuelType', f)}
                    />
                    <span className="option-check"><Check size={14} /></span>
                    <span className="option-label">{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button className="predict-btn" disabled={loading || !options} type="submit">
              {loading ? 'Calculating…' : <>Estimate car price <ArrowRight size={18} /></>}
            </button>
            <p className="form-note">The result is a statistical estimate from the trained Linear Regression model, not a guaranteed market price.</p>
          </form>

          <aside className={`result-card ${result ? 'has-result' : ''}`}>
            {!result ? (
              <div className="empty-result">
                <div className="result-icon"><Zap size={25} /></div>
                <span className="section-kicker">MODEL OUTPUT</span>
                <h3>Your estimate<br />will appear here.</h3>
                <p>Fill in the vehicle details and run the model.</p>
              </div>
            ) : (
              <div className="result-content">
                <span className="section-kicker">MODEL ESTIMATE</span>
                <div className="price">{money(result.predicted_price)}</div>
                <div className="result-label">estimated used-car price</div>
                <div className="car-summary">
                  <div className="mini-car"><CarFront size={28} /></div>
                  <div><strong>{form.year} {form.brand} {form.model}</strong><span>{form.fuelType} · {form.transmission} · {Number(form.mileage).toLocaleString()} miles</span></div>
                </div>
                <div className="confidence-row">
                  <span>Test R²</span><strong>{resultPercent}%</strong>
                </div>
                <div className="meter"><span style={{ width: `${Math.min(resultPercent, 100)}%` }} /></div>
                <div className="result-foot"><CheckCircle2 size={15} /> Prediction completed successfully</div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ── Model section ── */}
      <section id="model" className="model-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">02 / MODEL</span>
            <h2>What powers the estimate?</h2>
          </div>
        </div>
        <div className="metric-grid">
          <Metric icon={<BarChart3 />} value={metrics ? metrics.r2.toFixed(4) : '—'} label="R² score" detail="Test-set score" />
          <Metric icon={<TrendingUp />} value={metrics ? money(metrics.mae) : '—'} label="MAE" detail="Mean absolute error" />
          <Metric icon={<Gauge />} value={metrics ? money(metrics.rmse) : '—'} label="RMSE" detail="Root mean squared error" />
          <Metric icon={<CarFront />} value="99,187" label="Dataset rows" detail="Before duplicate removal" />
        </div>
        <div className="model-explainer">
          <div className="flow-step"><span>01</span><strong>Car details</strong><small>Brand, model, year, mileage…</small></div>
          <ArrowRight className="flow-arrow" />
          <div className="flow-step"><span>02</span><strong>Encoding</strong><small>Categories become numbers</small></div>
          <ArrowRight className="flow-arrow" />
          <div className="flow-step"><span>03</span><strong>Linear Regression</strong><small>Learns from training data</small></div>
          <ArrowRight className="flow-arrow" />
          <div className="flow-step highlight"><span>04</span><strong>Price estimate</strong><small>Predicted car price</small></div>
        </div>
      </section>

      {/* ── Workflow section ── */}
      <section id="workflow" className="workflow-section">
        <div>
          <span className="section-kicker">03 / WORKFLOW</span>
          <h2>From raw data to prediction.</h2>
        </div>
        <div className="workflow-list">
          {['Data collection', 'Data understanding', 'EDA & cleaning', 'Feature selection', 'Encoding & train/test split', 'Linear Regression', 'Evaluation & prediction'].map((item, index) => (
            <div className="workflow-item" key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><CheckCircle2 size={16} /></div>
          ))}
        </div>
      </section>

      {/* ── History ── */}
      {history.length > 0 && (
        <section className="history-section">
          <div className="section-heading"><div><span className="section-kicker">RECENT</span><h2>Predictions from this session.</h2></div><History size={20} /></div>
          <div className="history-grid">
            {history.map((item) => <div className="history-card" key={item.id}><span>{item.year} {item.label}</span><strong>{money(item.price)}</strong></div>)}
          </div>
        </section>
      )}
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   HOW IT WORKS PAGE
   ═══════════════════════════════════════════════════════════ */
function HowItWorksPage() {
  return (
    <main id="top" className="hiw-page">
      {/* Page Hero */}
      <section className="hiw-hero">
        <div className="eyebrow"><BookOpen size={15} /> MACHINE LEARNING EXPLAINED</div>
        <h1>How It Works</h1>
        <p className="hiw-subtitle">
          A beginner-friendly, step-by-step walkthrough of how our
          Linear Regression model predicts used car prices.
        </p>
        <div className="hiw-hero-tags">
          <span><Database size={14} /> 99,187 records</span>
          <span><Layers size={14} /> 5 numeric features</span>
          <span><Target size={14} /> R² = 0.8653</span>
        </div>
      </section>

      {/* ── SECTION 01 — Select Features ── */}
      <HiwSection
        number="01"
        title="Select Features"
        icon={<Layers size={20} />}
        description="We tell the model which columns to learn from (X) and what to predict (y)."
      >
        <CodeBlock
          code={`X = df[["year", "mileage", "tax", "mpg", "engineSize"]]\ny = df["price"]`}
          language="python"
        />
        <ExplainBlock>
          <strong>X</strong> = input features — the car attributes the model uses to learn.<br />
          <strong>y</strong> = target value — the actual price we want the model to predict.
        </ExplainBlock>
        <FlowVisual
          steps={['Car Features', 'Linear Regression', 'Price']}
          accent
        />
      </HiwSection>

      {/* ── SECTION 02 — Train / Test Split ── */}
      <HiwSection
        number="02"
        title="Train / Test Split"
        icon={<GitBranch size={20} />}
        description="We split the dataset so we can train on most of it and test on unseen data."
      >
        <CodeBlock
          code={`from sklearn.model_selection import train_test_split\n\nX_train, X_test, y_train, y_test = train_test_split(\n    X, y, test_size=0.2, random_state=42\n)`}
          language="python"
        />
        <ExplainBlock>
          <strong>80%</strong> of the data is used for training — the model learns from this.<br />
          <strong>20%</strong> is held back for testing — we use this to check how well the model generalises.
        </ExplainBlock>
        <div className="split-visual">
          <div className="split-total">
            <Database size={20} />
            <strong>99,187 Cars</strong>
          </div>
          <ArrowDown size={20} className="split-arrow" />
          <div className="split-boxes">
            <div className="split-box split-train">
              <strong>80%</strong>
              <span>Training Data</span>
              <small>~79,349 cars</small>
            </div>
            <div className="split-box split-test">
              <strong>20%</strong>
              <span>Testing Data</span>
              <small>~19,838 cars</small>
            </div>
          </div>
        </div>
      </HiwSection>

      {/* ── SECTION 03 — Train the Model ── */}
      <HiwSection
        number="03"
        title="Train the Model"
        icon={<Play size={20} />}
        description="We create a Linear Regression model and teach it using the training data."
      >
        <CodeBlock
          code={`from sklearn.linear_model import LinearRegression\n\nmodel = LinearRegression()\nmodel.fit(X_train, y_train)`}
          language="python"
        />
        <ExplainBlock>
          <strong>LinearRegression()</strong> creates a new, untrained model object.<br />
          <strong>model.fit()</strong> is the training step — the model learns the relationship
          between car features and their actual prices from the training data.
        </ExplainBlock>
        <FlowVisual
          steps={['Historical Cars', 'Features + Actual Prices', 'Training', 'Learned Relationship']}
        />
      </HiwSection>

      {/* ── SECTION 04 — Prediction ── */}
      <HiwSection
        number="04"
        title="Prediction"
        icon={<Zap size={20} />}
        description="We use the trained model to estimate prices for cars it has never seen."
      >
        <CodeBlock
          code={`y_pred = model.predict(X_test)`}
          language="python"
        />
        <ExplainBlock>
          <strong>predict()</strong> takes the test set features and uses the relationship learned
          during training to estimate a price for each car. The model has never seen these cars before.
        </ExplainBlock>
        <FlowVisual
          steps={['Car Details', 'Trained Model', 'Predicted Price']}
          accent
        />
      </HiwSection>

      {/* ── SECTION 05 — Evaluation ── */}
      <HiwSection
        number="05"
        title="Evaluation"
        icon={<BarChart3 size={20} />}
        description="We measure how accurate the model's predictions are using standard metrics."
      >
        <CodeBlock
          code={`from sklearn.metrics import mean_absolute_error\nfrom sklearn.metrics import mean_squared_error\nfrom sklearn.metrics import r2_score\n\nmae = mean_absolute_error(y_test, y_pred)\nmse = mean_squared_error(y_test, y_pred)\nrmse = mse ** 0.5\nr2 = r2_score(y_test, y_pred)`}
          language="python"
        />

        <div className="eval-grid">
          <EvalCard metric="MAE" value="£2,244.69" description="On average, the prediction is off by about £2,245. Think of it as the typical error in pounds." />
          <EvalCard metric="MSE" value="13,232,660.96" description="The average of squared errors. Larger errors are penalised more heavily. Mostly used to derive RMSE." />
          <EvalCard metric="RMSE" value="£3,637.67" description="Like MAE but punishes big misses more. A typical prediction misses by roughly £3,638." />
          <EvalCard metric="R²" value="0.8653" description="The model explains ~86.5% of the variation in price. A score of 1.0 would be perfect." highlight />
        </div>
      </HiwSection>

      {/* ── Complete Model Flow ── */}
      <section className="hiw-section hiw-pipeline">
        <div className="hiw-section-header">
          <span className="hiw-number">06</span>
          <div>
            <div className="eyebrow"><Eye size={15} /> COMPLETE PIPELINE</div>
            <h2>Complete Model Flow</h2>
          </div>
        </div>
        <div className="pipeline-flow">
          {[
            { label: 'Dataset', sub: '99,187 rows of used car data' },
            { label: 'Data Cleaning', sub: 'Remove duplicates & fix invalid values' },
            { label: 'Feature Selection', sub: 'Choose year, mileage, tax, mpg, engineSize' },
            { label: 'Train/Test Split', sub: '80% train · 20% test' },
            { label: 'Linear Regression', sub: 'Create the model' },
            { label: 'Training', sub: 'model.fit() learns from data' },
            { label: 'Prediction', sub: 'model.predict() estimates prices' },
            { label: 'Evaluation', sub: 'MAE, RMSE, R² metrics' },
            { label: 'Used Car Price', sub: 'Final predicted value', highlight: true },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className={`pipeline-step${step.highlight ? ' pipeline-highlight' : ''}`}>
                <span className="pipeline-num">{String(i + 1).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
                <small>{step.sub}</small>
              </div>
              {i < arr.length - 1 && <ArrowDown size={18} className="pipeline-arrow" />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── Complete Core Code ── */}
      <section className="hiw-section hiw-core-code">
        <div className="hiw-section-header">
          <span className="hiw-number">07</span>
          <div>
            <div className="eyebrow"><Code2 size={15} /> COMPLETE CODE</div>
            <h2>The Core Code</h2>
            <p className="hiw-section-desc">Everything in one clean block — from feature selection to evaluation.</p>
          </div>
        </div>
        <CodeBlock
          code={`# Feature Selection
X = df[features]
y = df["price"]

# Train / Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train the Model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict
y_pred = model.predict(X_test)

# Evaluate
r2 = r2_score(y_test, y_pred)`}
          language="python"
          large
        />
      </section>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   HIW Sub-Components
   ═══════════════════════════════════════════════════════════ */

function HiwSection({ number, title, icon, description, children }) {
  return (
    <section className="hiw-section">
      <div className="hiw-section-header">
        <span className="hiw-number">{number}</span>
        <div>
          <div className="eyebrow">{icon} SECTION {number}</div>
          <h2>{title}</h2>
          <p className="hiw-section-desc">{description}</p>
        </div>
      </div>
      <div className="hiw-section-body">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ code, language = 'python', large }) {
  return (
    <div className={`code-block${large ? ' code-block-large' : ''}`}>
      <div className="code-header">
        <Code2 size={14} />
        <span>{language}</span>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function ExplainBlock({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`explain-block${open ? ' explain-open' : ''}`}>
      <button className="explain-toggle" onClick={() => setOpen(!open)}>
        <Lightbulb size={16} />
        <span>{open ? 'Hide Explanation' : 'Explain This'}</span>
        <ChevronDown size={16} className={`explain-chevron${open ? ' explain-chevron-open' : ''}`} />
      </button>
      {open && <div className="explain-content">{children}</div>}
    </div>
  );
}

function FlowVisual({ steps, accent }) {
  return (
    <div className={`flow-visual${accent ? ' flow-accent' : ''}`}>
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="fv-step">{step}</div>
          {i < steps.length - 1 && <ArrowRight size={18} className="fv-arrow" />}
        </React.Fragment>
      ))}
    </div>
  );
}

function EvalCard({ metric, value, description, highlight }) {
  return (
    <div className={`eval-card${highlight ? ' eval-highlight' : ''}`}>
      <div className="eval-top">
        <span className="eval-metric">{metric}</span>
        <strong className="eval-value">{value}</strong>
      </div>
      <p>{description}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function Field({ label, children }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function Select({ value, onChange, options }) {
  return <div className="select-wrap"><select value={value} onChange={onChange}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select><ChevronDown size={16} /></div>;
}

function Metric({ icon, value, label, detail }) {
  return <div className="metric-card"><div className="metric-icon">{icon}</div><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>;
}

createRoot(document.getElementById('root')).render(<App />);
