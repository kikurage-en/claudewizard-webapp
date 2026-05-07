import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { WizardState, WizardAction, Plan } from './types'
import { wizardReducer, createInitialState } from './reducer'

type WizardContextValue = {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const WizardContext = createContext<WizardContextValue | null>(null)

type Props = {
  plan: Plan
  children: ReactNode
}

export function WizardProvider({ plan, children }: Props) {
  const [state, dispatch] = useReducer(wizardReducer, createInitialState(plan))
  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard must be used within WizardProvider')
  return ctx
}
