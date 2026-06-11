import { useState, useEffect } from 'react'
import { LanguageProvider } from '../i18n/context'
import { WizardProvider, useWizard } from '../wizard/WizardProvider'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { TopPage } from './pages/TopPage'
import { ApiKeyPage } from './pages/ApiKeyPage'
import { WizardPage } from './pages/WizardPage'
import { CompletePage } from './pages/CompletePage'
import { TermsPage } from './pages/TermsPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { useRoute } from './router/useRoute'
import type { Lang } from '../i18n/types'
import type { Plan, WizardState } from '../wizard/types'
import { navigate } from './router/routes'
import { trackPageView, trackPlanSelect, trackLanguageSwitch } from '../analytics/events'

export function App() {
  const route = useRoute()
  const lang: Lang = (route.name !== 'not-found' && route.lang) ? route.lang : 'ja'

  const [completedState, setCompletedState] = useState<{
    plan: Plan
    answers: Record<string, string>
  } | null>(null)

  const [wizardPlan, setWizardPlan] = useState<Plan>('free')

  useEffect(() => {
    if (route.name !== 'not-found') {
      trackPageView(`/${lang}/${route.name === 'top' ? '' : route.name}`, lang)
    }
  }, [route, lang])

  // hash 遷移はブラウザがスクロール位置を引き継ぐため、ページが変わったら最上部へ戻す
  // （言語切替は route.name 不変＝同一コンテンツなので位置を維持する）
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name])

  // /complete は completedState（メモリ上の完了状態）が前提のルート。
  // リロード・直リンクで状態がない場合はトップへ正規化し、URL/表示/page_view の不一致を残さない
  // （表示自体は下のフォールバック分岐が遮断済み。空回答での生成経路はここで URL ごと閉じる）
  useEffect(() => {
    if (route.name === 'complete' && !completedState) {
      navigate(`/${lang}`)
    }
  }, [route, completedState, lang])

  const handleLanguageChange = (newLang: Lang) => {
    trackLanguageSwitch(lang, newLang)
    const sub = route.name !== 'top' && route.name !== 'not-found' ? route.name : ''
    navigate(sub ? `/${newLang}/${sub}` : `/${newLang}`)
  }

  const handleSelectPlan = (plan: Plan) => {
    trackPlanSelect(plan)
    setWizardPlan(plan)
    if (plan === 'light' || plan === 'plus') {
      navigate(`/${lang}/api-key`)
    } else {
      navigate(`/${lang}/wizard`)
    }
  }

  const handleApiKeyContinue = () => {
    navigate(`/${lang}/wizard`)
  }

  const handleWizardComplete = (state: WizardState) => {
    setCompletedState({ plan: state.plan, answers: state.answers })
    navigate(`/${lang}/complete`)
  }

  const handleTryAgain = () => {
    setCompletedState(null)
    // トップへ戻る際にプラン選択もリセット（ヒーロー CTA から #/wizard へ直接入った場合に前回プランが残る漏れを防ぐ）
    setWizardPlan('free')
    navigate(`/${lang}`)
  }

  const showHeader = route.name !== 'wizard' && route.name !== 'api-key'
  const showFooter = route.name !== 'wizard' && route.name !== 'api-key'

  return (
    <LanguageProvider lang={lang}>
      <div className="min-h-screen flex flex-col bg-cream">
        {showHeader && (
          <Header lang={lang} onLanguageChange={handleLanguageChange} />
        )}

        <div className="flex-1">
          {route.name === 'top' && (
            <TopPage lang={lang} onSelectPlan={handleSelectPlan} />
          )}

          {route.name === 'api-key' && (
            <ApiKeyPage
              lang={lang}
              plan={wizardPlan}
              onContinue={handleApiKeyContinue}
              onCancel={handleTryAgain}
            />
          )}

          {route.name === 'wizard' && (
            <WizardProvider plan={wizardPlan}>
              <WizardPageWrapper
                lang={lang}
                onComplete={handleWizardComplete}
                onCancel={handleTryAgain}
              />
            </WizardProvider>
          )}

          {route.name === 'complete' && completedState && (
            <CompletePage
              lang={lang}
              plan={completedState.plan}
              answers={completedState.answers}
              onTryAgain={handleTryAgain}
            />
          )}

          {route.name === 'complete' && !completedState && (
            <TopPage lang={lang} onSelectPlan={handleSelectPlan} />
          )}

          {route.name === 'terms' && <TermsPage lang={lang} />}
          {route.name === 'privacy' && <PrivacyPage lang={lang} />}
          {route.name === 'not-found' && <NotFoundPage />}
        </div>

        {showFooter && <Footer lang={lang} />}
      </div>
    </LanguageProvider>
  )
}

function WizardPageWrapper({
  lang,
  onComplete,
  onCancel,
}: {
  lang: Lang
  onComplete: (state: WizardState) => void
  onCancel: () => void
}) {
  const { state } = useWizard()

  return (
    <WizardPage
      lang={lang}
      onComplete={() => onComplete(state)}
      onCancel={onCancel}
    />
  )
}
