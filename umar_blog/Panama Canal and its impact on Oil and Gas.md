---
title: Can news sentiment and Panama Canal congestion predict oil & gas earnings?
pubDatetime: 2026-04-28T16:50:55+08:00
description: ""
format: notes
tags:
  - others
featured: true
draft: false
---



Most earnings forecasts use accounting data — revenue, costs, debt, equity. They work, but they're backward-looking. By the time a quarterly report shows a margin squeeze, the market has already priced it in.

So my project group at NUS asked a different question:

> **What if forward-looking signals — what people are saying about the industry, and physical disruptions to oil shipping — could predict next quarter's revenue and EBITDA before the accounting catches up?**

We built a five-stage ML pipeline forecasting next-quarter Revenue and EBITDA for U.S. oil & gas firms. The traditional features came from Compustat. On top of those, we layered four "advanced" features: news sentiment scored by an LLM, Panama Canal transit volumes, the Piotroski F-Score, and a custom Efficiency Score.

Here's the surprise: **the advanced features barely helped.** That's actually the most interesting finding, and a big part of what this post is about.

Code on [GitHub](https://github.com/notahotdog/ft5005-oilgas-prediction).
Full report (PDF) is in the [`docs/`](https://github.com/notahotdog/ft5005-oilgas-prediction/tree/main/docs) folder.

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:1.5rem 0;">
  <iframe
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
    src="https://www.youtube.com/embed/c9IpvOwYtEc"
    title="Demo: Predicting oil & gas earnings with news sentiment + Panama Canal data"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerpolicy="strict-origin-when-cross-origin"
    allowfullscreen
  ></iframe>
</div>

## Why oil & gas, and why these features?

Oil & gas was a deliberate pick. Three reasons:

1. **Earnings are highly sensitive to commodity prices and geopolitics.** Pure-accounting forecasts get noisy.
2. **The industry has clean macro proxies** — Panama Canal transits, oil-price uncertainty indices, refinery throughput.
3. **News coverage is dense.** Plenty of text to mine for sentiment.

The targets we forecast were quarterly **Revenue** (`revtq`) and **EBITDA** (`oibdpq`, operating income before depreciation), both log-transformed. The log transform matters — it normalizes the heavy right-skew in firm-level financials and is why the R² scores you'll see later look high. We're explaining variance on a log scale.

The split: train on data through Dec 31, 2020 (~90% of the sample), test on Jan 1, 2021 through end of 2024. That out-of-sample window deliberately includes COVID recovery, Russia/Ukraine, the 2023 Panama drought, and the 2024 election cycle — a rough patch.

### The advanced features

#### 1. News sentiment

Standard fundamentals tell you what *happened*. Sentiment tells you what people *expect*.

We scraped oil & gas headlines via Google Custom Search, then asked ChatGPT-o4-mini to score each one on two axes: relevance to the industry's financial performance (0–1) and directional sentiment (–5 to +5). After filtering by relevance, we aggregated to per-firm-per-quarter averages.

Intuition: when coverage darkens for an industry — supply disruptions, regulatory threats, demand worries — those concerns precede the earnings impact.

#### 2. Panama Canal transits (the project's hook)

This was the angle I personally pitched, and the project's most distinctive feature.

In 2023–24, the Panama Canal Authority restricted ship transits because of drought — water levels in Gatún Lake dropped low enough that they couldn't lock as many ships per day. Oil and LNG tankers carrying U.S. exports to Asia rerouted around South America: longer, more expensive, slower.

Around the same time, Trump began publicly threatening to "take back" the Panama Canal, citing transit fees and Chinese influence. Climate friction and geopolitical friction, hitting the same chokepoint.

The Atlantic Council reported an **82% decline in U.S.-to-Asia LNG shipments via the canal between 2021 and 2023, paired with a 472% increase in alternate routing around the Cape of Good Hope.** Energy cargo makes up nearly 50% of canal volume by weight.

So we used **monthly canal transit counts (log-transformed)** from CEIC as the Canal Vessel Transit Volume feature. Lower transits → tighter logistics → potential pricing and timing impact on quarterly revenue.

#### 3. Piotroski F-Score

A 9-point financial-health checklist (positive net income? positive operating cash flow? higher ROA than last year? declining long-term debt ratio? etc.). Each criterion is binary, so 0–9. Higher = healthier firm. We used ChatGPT to compute it from the underlying Compustat fields.

#### 4. Efficiency Score

A custom composite ratio capturing operational effectiveness: gross profit growth + asset turnover + EBITDA-to-cash conversion, divided by SG&A intensity + capex intensity. Heavy outliers, so we winsorized at the 1st/99th percentile.

## The five-stage pipeline

The structure matters more than any individual stage, so I'll keep each short.

**Stage 1 — Baselines.** Naïve persistence (predict next quarter = this quarter), OLS on lagged target, ARIMA(1,0,0). The bar to beat.

**Stage 2 — Wide model sweep.** Train 16 model families (linear, tree-based, neural, kernel, boosting) on the full feature set with `TimeSeriesSplit(5)` cross-validation. Pick the architecture that wins.

**Stage 3 — Feature selection.** Filter by Pearson + mutual information, rank with RandomForest importance and permutation importance, prune with RFE and LassoCV. Keep the intersection.

**Stage 4 — Ablation.** Train the same model twice — once on Compustat fundamentals only, once on fundamentals + advanced features. Measure the lift.

**Stage 5 — Stacking + interpretability.** Build a `StackingRegressor` (multiple base learners feeding a meta-learner) and compute SHAP values on the final model.

## What actually happened

### Stage 1: time-series baselines were *worse than the mean*

| Model | Revenue R² | EBITDA R² |
|---|---|---|
| Naïve persistence | **−0.91** | **−0.95** |
| OLS on lag | −0.03 | −0.10 |
| ARIMA(1,0,0) | −0.03 | −0.11 |

Yes, those are negative R². They mean: just predicting the cross-firm mean would do better than predicting "next quarter equals this quarter." Quarterly firm-level data is heterogeneous enough across companies that simple persistence breaks badly. This was the most surprising baseline result for me — I expected naïve persistence to be a tough bar, not an embarrassment.

### Stage 2: XGBoost and LightGBM destroyed everything else

| Model | Revenue R² | EBITDA R² |
|---|---|---|
| LightGBM | **0.9994** | 0.9992 |
| XGBoost | 0.9967 | **0.9983** |
| Gradient Boosting | 0.9951 | 0.9978 |
| Random Forest | 0.9870 | 0.9751 |
| MLP | 0.8939 | 0.8141 |
| Linear / Ridge / Bayesian Ridge | ~0.54 | ~0.55 |
| Lasso / ElasticNet | 0.0000 | 0.0000 |

(R² is on the log-transformed target, hence the high numbers — they are *not* directly comparable to R² on raw revenue.)

Two things stand out. First, **the boosted-tree family wins by a lot.** Tree boosters handle the mix of scales (firm assets in millions, sentiment from −5 to +5) without manual normalization, and they capture the non-linear interactions that linear models can't. Second, **Lasso and ElasticNet completely failed.** With heavy regularization on log-transformed targets, they shrank everything to the mean.

We picked XGBoost as the working baseline (LightGBM was marginally better but harder to interpret with SHAP).

### Stage 3: feature selection trimmed to ~9 features and barely changed scores

The pipeline picked **9 features for Revenue** (current liabilities, asset turnover, debt ratios, receivables, common equity, total assets, COGS, debt-to-equity, operating expense) and **8 features for EBITDA** (current liabilities, ROA, PP&E, common equity, gross PP&E, accounts payable, ROCE, total assets).

| Target | Without selection (R²) | With selection (R²) |
|---|---|---|
| Revenue | 0.9967 | 0.9970 |
| EBITDA | 0.9983 | 0.9987 |

Marginal lift. But the value isn't in the score — it's in the **simplification**. From 30+ features down to 8–9 with no performance loss is a real win for interpretability and overfitting risk.

### Stage 4: the advanced features didn't help

This is the result that surprised me most.

| Target | Core only (R²) | Core + advanced (R²) |
|---|---|---|
| Revenue | 0.9967 | 0.9967 |
| EBITDA | 0.9983 | 0.9983 |

R² unchanged. RMSE moved by 0.0001 for Revenue and stayed flat for EBITDA. MAE *increased* slightly for EBITDA (0.0063 → 0.0064).

Translation: news sentiment, Panama Canal transits, Piotroski F-Score, and our Efficiency Score added **basically nothing** on top of plain Compustat fundamentals.

Why? A few possibilities:

- **Quarterly granularity is too coarse.** Sentiment shifts and canal disruptions play out over weeks. By the time you aggregate to a quarter, the signal is washed out.
- **Signal overlap.** A drop in canal transits also shows up in firm fundamentals one quarter later (lower COGS, higher receivables). The model already gets the information through the accounting.
- **Sample size for the canal feature.** Severe canal disruptions are concentrated in 2023–24. Outside that window, the feature is roughly constant, so the model can't learn from it.
- **The Piotroski F-Score is a transformation of the same fundamentals.** Adding it to the feature set is somewhat circular.

I went into this project expecting Panama Canal congestion to be the killer feature. It wasn't. That's an honest result, and writing the blog post means saying so.

### Stage 5: stacking helped, especially for EBITDA

Building a `StackingRegressor` over four base learners (Random Forest, Gradient Boosting, MLP, XGBoost) with a regularized linear meta-learner improved things — sometimes dramatically.

**Revenue (compact feature set + advanced):**

| Model | R² | RMSE |
|---|---|---|
| Gradient Boosting (best base) | 0.9948 | 0.0168 |
| Stacking_MLP | **0.9958** | **0.0151** |

**EBITDA (compact feature set + advanced):**

| Model | R² | RMSE |
|---|---|---|
| Gradient Boosting (best base) | 0.9525 | 0.0506 |
| Stacking_MLP | **0.9958** | 0.0489 |

For EBITDA, R² jumped from 0.95 to 0.9958 — an order of magnitude reduction in unexplained variance. Stacking turned out to be the single biggest performance lever in the whole pipeline.

Why does stacking work here? Each base model has different blind spots. XGBoost handles non-linear interactions; the MLP picks up smooth global patterns; Random Forest is robust to outliers. The meta-learner figures out which model to trust for which kind of input. With heterogeneous time-series data, that diversity pays off.

## What I'd do differently

If I were to do a v2:

- **Higher-frequency data.** Quarterly is too slow for sentiment and canal features to express themselves. Monthly or biweekly would let those signals breathe.
- **Held-out firms, not just held-out quarters.** Right now we test on future quarters of *the same* firms. A stricter test would hold out entire firms to check whether the model generalizes across companies, not just across time.
- **Fully-scripted sentiment pipeline.** There's still a manual ChatGPT-prompting step in the news scoring that should be a direct API call.
- **Causal framing for the canal feature.** Instead of "does canal volume predict revenue?", ask "did the 2023 drought *cause* a measurable shock to firms with high canal exposure?". A diff-in-diff or event study would be more honest about what we can and can't claim.

## What I took away

Most ML projects in school are MNIST / IMDB / Titanic. They're fine for learning the mechanics, but the data is solved — you're not adding signal, you're rediscovering what's already known.

This project was the first time I worked with data where:

- The features required actual domain reasoning (why would Panama Canal transits matter for quarterly EBITDA?).
- The data wasn't redistributable (Compustat licensing forced us to think about reproducibility differently).
- The "creative" features I was most excited about turned out not to work, and the boring scaffolding (stacking ensembles, log transforms, time-aware splits) turned out to do most of the heavy lifting.

The third one is the lesson I'll keep. Novel features make for a good pitch, but well-executed fundamentals win on the test set. That's not a discouraging takeaway — it's the right one.

---

**Code:** [github.com/notahotdog/ft5005-oilgas-prediction](https://github.com/notahotdog/ft5005-oilgas-prediction)
**Demo walkthrough:** [YouTube](https://youtu.be/c9IpvOwYtEc)
**Full report:** in the [`docs/`](https://github.com/notahotdog/ft5005-oilgas-prediction/tree/main/docs) folder of the repo (PDF)

Compustat data is licensed and not redistributed in the repo; you'll need WRDS access to fully reproduce.