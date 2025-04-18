'use client'

import * as React from 'react'
import { useMemo, useState, useContext, createContext, useCallback } from 'react'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEditDepth } from '@payloadcms/ui'

import { DEFAULT_EDITOR_SETTINGS } from './default'

import type { EditorSettings, OptionName } from './types'

// Should always produce a 20 character pseudo-random string
function generateQuickGuid(): string {
  return Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12)
}
interface ContextType {
  setOption: (name: OptionName, value: boolean) => void
  config: EditorSettings
  uuid: string
}

const Context: React.Context<ContextType> = createContext({
  setOption: (name: OptionName, value: boolean) => {},
  config: DEFAULT_EDITOR_SETTINGS,
  uuid: generateQuickGuid()
})

export const EditorConfigContext = ({
  children,
  config: configFromProps
}: {
  children: React.ReactNode
  config?: EditorSettings
}): React.JSX.Element => {
  const [config, setConfig] = useState(configFromProps ?? DEFAULT_EDITOR_SETTINGS)
  // State to store the UUID
  const [uuid] = useState(() => generateQuickGuid())
  const [editor] = useLexicalComposerContext()
  const editDepth = useEditDepth()

  const setOption = useCallback((option: OptionName, value: boolean) => {
    setConfig((config) => {
      const options = { ...config.options, [option as string]: value }
      return { ...config, options }
    })
  }, [])

  const editorContext = useMemo(
    () => ({ setOption, config, uuid, editDepth, editor }),
    [setOption, config, uuid, editDepth, editor]
  )

  return <Context.Provider value={editorContext}>{children}</Context.Provider>
}

export const useEditorConfig = (): ContextType => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useEditorConfig must be used within an EditorConfigContext')
  }
  return context
}
