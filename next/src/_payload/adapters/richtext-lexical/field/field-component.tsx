'use client'
/**
 * Portions copyright (c) 2018-2022 Payload CMS, LLC info@payloadcms.com
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Adapted from https://github.com/payloadcms/payload/tree/main/packages/richtext-lexical
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import type { EditorState, SerializedEditorState } from 'lexical'
import type { Validate } from 'payload'

import { 
  FieldDescription,
  FieldError,
  FieldLabel,
  RenderCustomComponent,
  useEditDepth,
  useEffectEvent,
  useField
} from '@payloadcms/ui'
import { mergeFieldStyles } from '@payloadcms/ui/shared'

import { richTextValidate } from '../validate/validate-server'
import { EditorContext } from './editor-context'

import type { LexicalRichTextFieldProps } from '../types'

import './field-component.css'
import './themes/lexical-editor-theme.css'

const baseClass = 'lexicalRichTextEditor'

const RichTextComponent: React.FC<LexicalRichTextFieldProps> = (props) => {
  const {
    editorConfig,
    field,
    field: {
      name,
      admin: { className, description, readOnly: readOnlyFromAdmin } = {},
      label,
      localized,
      required
    },
    path: pathFromProps,
    readOnly: readOnlyFromTopLevelProps,
    validate, // = richTextValidate
  } = props

  const readOnlyFromProps = readOnlyFromTopLevelProps || readOnlyFromAdmin
  const path = pathFromProps ?? name

  const editDepth = useEditDepth()

  const memoizedValidate = useCallback<Validate>(
    (value, validationOptions) => {
      if (typeof validate === 'function') {
        // @ts-expect-error - vestiges of when tsconfig was not strict. Feel free to improve
        return validate(value, { ...validationOptions, required })
      }
      return true
    },
    // Important: do not add props to the dependencies array.
    // This would cause an infinite loop and endless re-rendering.
    // Removing props from the dependencies array fixed this issue: https://github.com/payloadcms/payload/issues/3709
    [validate, required],
  )

  const {
    customComponents: { AfterInput, BeforeInput, Description, Error, Label } = {},
    disabled: disabledFromField,
    initialValue,
    setValue,
    showError,
    value
  } = useField<SerializedEditorState>({
    path: pathFromProps ?? name,
    validate: memoizedValidate
  })

  // TODO: work out why disabledFromField is true on first load of 
  // main (non-block) editor, but not on the block editor.
  const disabled = readOnlyFromProps || disabledFromField  // || false

  const [rerenderProviderKey, setRerenderProviderKey] = useState<Date>()

  const prevInitialValueRef = React.useRef<SerializedEditorState | undefined>(initialValue)
  const prevValueRef = React.useRef<SerializedEditorState | undefined>(value)

  const classes = [
    baseClass,
    'field-type',
    className,
    showError && 'error',
    disabled && `${baseClass}--read-only`,
    editorConfig.admin?.hideGutter !== true ? `${baseClass}--show-gutter` : null
  ]
    .filter(Boolean)
    .join(' ')

  const pathWithEditDepth = `${path}.${editDepth}`

  // Debounce editor as per this Payload PR and commit:
  // https://github.com/payloadcms/payload/pull/12046
  // https://github.com/payloadcms/payload/commit/101f765
  const updateFieldValue = (editorState: EditorState) => {
    const newState = editorState.toJSON()
    prevValueRef.current = newState
    setValue(newState)
  }

  const handleChange = useCallback(
    (editorState: EditorState) => {
      if (typeof window.requestIdleCallback === 'function') {
        requestIdleCallback(() => updateFieldValue(editorState), {
          timeout: 500,})
      } else {
        updateFieldValue(editorState)
      }
    },
    [setValue],
  )

  const styles = useMemo(() => mergeFieldStyles(field), [field])

  const handleInitialValueChange = useEffectEvent(
    (initialValue: SerializedEditorState | undefined) => {
      // Object deep equality check here, as re-mounting the editor if
      // the new value is the same as the old one is not necessary
      if (
        prevValueRef.current !== value &&
        JSON.stringify(prevValueRef.current) !== JSON.stringify(value)
      ) {
        prevInitialValueRef.current = initialValue
        prevValueRef.current = value
        setRerenderProviderKey(new Date())
      }
    },
  )

  useEffect(() => {
    // Needs to trigger for object reference changes - otherwise,
    // reacting to the same initial value change twice will cause
    // the second change to be ignored, even though the value has changed.
    // That's because initialValue is not kept up-to-date
    if (!Object.is(initialValue, prevInitialValueRef.current)) {
      handleInitialValueChange(initialValue)
    }
  }, [initialValue, handleInitialValueChange])

  return (
    <div className={classes} key={pathWithEditDepth} style={styles}>
      <div className={`${baseClass}__wrap`}>
        <RenderCustomComponent
          CustomComponent={Error}
          Fallback={<FieldError path={path} showError={showError} />}
        />
        {Label || <FieldLabel label={label} localized={localized} path={path} required={required} />}
        <ErrorBoundary fallbackRender={fallbackRender} onReset={() => {}}>
          {BeforeInput}
          <EditorContext
            composerKey={pathWithEditDepth}
            editorConfig={editorConfig}
            fieldProps={props}
            key={JSON.stringify({ path, rerenderProviderKey })} // makes sure lexical is completely re-rendered when initialValue changes, bypassing the lexical-internal value memoization. That way, external changes to the form will update the editor. More infos in PR description (https://github.com/payloadcms/payload/pull/5010)
            onChange={handleChange}
            readOnly={disabled}
            value={value}
            // NOTE: 2023-05-15 disabled the deepEqual since we've set ignoreSelectionChange={true}
            // in our OnChangePlugin instances - and so a call here means that something
            // must have changed - so no need to do the comparison.
            // onChange={(editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
            //   if (!disabled) {
            //     const serializedEditorState = editorState.toJSON()
            //     // TODO: 2024-01-30 - re-test this.
            //     // NOTE: 2023-06-28 fix for setValue below. For some reason when
            //     // this custom field is used in a block field, setValue on its
            //     // own won't enable Save Draft or Publish Changes during a first
            //     // add of a new block (it will after the entire document is saved
            //     // and reloaded - but not before.) So call setModified(true) here
            //     // to guarantee that we can always save our changes.
            //     // setModified(true)
            //     // NOTE: 2024-05-02: Appears to be fixed - and setModified(true)
            //     // is no longer required.
            //     setValue(serializedEditorState)
            //   }
            // }}
          />
          {AfterInput}
        </ErrorBoundary>
        {Description}
        <RenderCustomComponent
          CustomComponent={Description}
          Fallback={<FieldDescription description={description} path={path} />}
        />
      </div>
    </div>
  )
}

function fallbackRender({ error, resetErrorBoundary }: any): React.JSX.Element {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div className="errorBoundary" role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

export const RichText: typeof RichTextComponent = RichTextComponent
