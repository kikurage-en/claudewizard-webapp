import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TextInput } from '../components/TextInput'

describe('TextInput', () => {
  it('ラベルと入力欄が表示される', () => {
    render(<TextInput id="name" label="プロジェクト名" value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText('プロジェクト名')).toBeInTheDocument()
  })

  it('onChange が値を渡して呼ばれる', () => {
    const onChange = vi.fn()
    render(<TextInput id="name" label="名前" value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'my-app' } })
    expect(onChange).toHaveBeenCalledWith('my-app')
  })

  it('Enter キーで onEnter が呼ばれる', () => {
    const onEnter = vi.fn()
    render(<TextInput id="name" label="名前" value="test" onChange={vi.fn()} onEnter={onEnter} />)
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    expect(onEnter).toHaveBeenCalledTimes(1)
  })

  it('onEnter が未指定の場合 Enter キーでエラーにならない', () => {
    render(<TextInput id="name" label="名前" value="test" onChange={vi.fn()} />)
    expect(() => {
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' })
    }).not.toThrow()
  })

  it('プレースホルダーが表示される', () => {
    render(
      <TextInput id="name" label="名前" value="" placeholder="例: my-project" onChange={vi.fn()} />
    )
    expect(screen.getByPlaceholderText('例: my-project')).toBeInTheDocument()
  })

  it('isValid=false のときエラースタイルが適用される', () => {
    render(<TextInput id="name" label="名前" value="" onChange={vi.fn()} isValid={false} />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-400')
  })
})
