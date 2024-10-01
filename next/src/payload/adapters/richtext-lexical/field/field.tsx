'use client'
/**
 * Originally based on https://github.com/AlessioGr/payload-plugin-lexical
 */

import React, { useCallback } from 'react'

import { ErrorBoundary } from 'react-error-boundary'

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  useFieldProps,
  withCondition
} from '@payloadcms/ui'

import { richTextValidate } from '../validate/validate-server'
import { EditorContext } from './editor-context'

import type { EditorState, LexicalEditor, SerializedEditorState } from 'lexical'
import type { RichTextFieldClientProps } from 'payload'
import type { AdapterProps } from '../types'
import type { EditorConfig } from './config'

import './field.scss'
import './themes/lexical-editor-theme.scss'

const baseClass = 'lexicalRichTextEditor'

const RichText: React.FC<
  {
    readonly editorConfig: EditorConfig
  } & RichTextFieldClientProps<SerializedEditorState, AdapterProps, object>
> = (props) => {
  const {
    editorConfig,
    field,
    labelProps,
    descriptionProps,
    errorProps,
    field: {
      name,
      _path: pathFromProps,
      admin: { className, description, readOnly: readOnlyFromAdmin, style, width } = {},
      label,
      required
    },
    readOnly: readOnlyFromTopLevelProps,
    validate = richTextValidate
  } = props

  const readOnlyFromProps = readOnlyFromTopLevelProps || readOnlyFromAdmin

  const memoizedValidate = useCallback(
    (value: any, validationOptions: any) => {
      if (typeof validate === 'function') {
        return validate(value, { ...validationOptions, props, required })
      } else {
        return true
      }
    },
    // Important: do not add props to the dependencies array.
    // This would cause an infinite loop and endless re-rendering.
    // Removing props from the dependencies array fixed this issue: https://github.com/payloadcms/payload/issues/3709
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validate, required]
  )

  const { path: pathFromContext, readOnly: readOnlyFromContext } = useFieldProps()

  const fieldType = useField<SerializedEditorState>({
    path: pathFromContext ?? pathFromProps ?? name,
    validate: memoizedValidate
  })

  const {
    formInitializing,
    formProcessing,
    initialValue,
    path,
    setValue,
    showError,
    errorMessage,
    value
  } = fieldType

  const disabled = readOnlyFromProps || readOnlyFromContext || formProcessing // || formInitializing

  const classes = [
    baseClass,
    'field-type',
    className,
    showError && 'error',
    disabled && `${baseClass}--read-only`
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{
        ...style,
        width
      }}
    >
      <div className={`${baseClass}__wrap`}>
        <FieldError field={field} showError={showError} message={errorMessage ?? ''} />
        <FieldLabel
          field={field}
          htmlFor={`field-${path.replace(/\./gi, '__')}`}
          label={label}
          required={required}
        />

        <ErrorBoundary fallbackRender={fallbackRender} onReset={() => {}}>
          <EditorContext
            editorConfig={editorConfig}
            fieldProps={props}
            path={path}
            readOnly={disabled}
            value={value}
            key={JSON.stringify({ initialValue, path })} // makes sure lexical is completely re-rendered when initialValue changes, bypassing the lexical-internal value memoization. That way, external changes to the form will update the editor. More infos in PR description (https://github.com/payloadcms/payload/pull/5010)
            // NOTE: 2023-05-15 disabled the deepEqual since we've set ignoreSelectionChange={true}
            // in our OnChangePlugin instances - and so a call here means that something
            // must have changed - so no need to do the comparison.
            onChange={(editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
              if (!disabled) {
                const serializedEditorState = editorState.toJSON()
                // TODO: 2024-01-30 - re-test this.
                // NOTE: 2023-06-28 fix for setValue below. For some reason when
                // this custom field is used in a block field, setValue on its
                // own won't enable Save Draft or Publish Changes during a first
                // add of a new block (it will after the entire document is saved
                // and reloaded - but not before.) So call setModified(true) here
                // to guarantee that we can always save our changes.
                // setModified(true)
                // NOTE: 2024-05-02: Appears to be fixed - and setModified(true)
                // is no longer required.
                setValue(serializedEditorState)
              }
            }}
          />
        </ErrorBoundary>
        <FieldDescription field={field} description={description as string} />
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

export default withCondition(RichText)
