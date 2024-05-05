'use client'
/**
 * Originally based on https://github.com/AlessioGr/payload-plugin-lexical
 */

import * as React from 'react'
import { useCallback } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

import { FieldDescription } from '@payloadcms/ui/forms/FieldDescription'
import { FieldError } from '@payloadcms/ui/forms/FieldError'
import { FieldLabel } from '@payloadcms/ui/forms/FieldLabel'
import { useFieldProps } from '@payloadcms/ui/forms/FieldPropsProvider'
import { useField } from '@payloadcms/ui/forms/useField'
import { withCondition } from '@payloadcms/ui/forms/withCondition'
import { richTextValidate } from '../validate/validate-client'

import { EditorContext } from './editor-context'

import type { EditorState, LexicalEditor, SerializedEditorState } from 'lexical'

import './field.scss'
import { RichTextFieldProps } from 'payload/types'
import { AdapterProps } from '../types'

const baseClass = 'lexicalRichTextEditor'

const RichText: React.FC<RichTextFieldProps<SerializedEditorState, AdapterProps, any>> = (
  props,
) => {
  const {
    name,
    label,
    admin: { className = '', description = '', readOnly = false, style = null, width = '' } = {},
    editorConfig,
    path: pathFromProps,
    required,
    validate = richTextValidate,
  } = props

  const memoizedValidate = useCallback(
    (value: any, validationOptions: any) => {
      if (typeof validate === 'function') {
        return validate(value, { ...validationOptions, props, required })
      }
    },
    // Important: do not add props to the dependencies array.
    // This would cause an infinite loop and endless re-rendering.
    // Removing props from the dependencies array fixed this issue: https://github.com/payloadcms/payload/issues/3709
    [validate, required, props],
  )

  const { path: pathFromContext } = useFieldProps()
  const path = pathFromContext || pathFromProps || name

  const field = useField<SerializedEditorState>({
    path,
    validate: memoizedValidate,
  })

  const { showError, errorMessage, initialValue, value, setValue } = field

  const classes = [
    baseClass,
    'field-type',
    className,
    showError && 'error',
    readOnly && `${baseClass}--read-only`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      style={{
        ...style,
        width,
      }}
    >
      <div className={`${baseClass}__wrap`}>
        <FieldError showError={showError} message={errorMessage ?? ''} />
        <FieldLabel
          htmlFor={`field-${path.replace(/\./gi, '__')}`}
          label={label}
          required={required}
        />
        <ErrorBoundary fallbackRender={fallbackRender} onReset={() => {}}>
          <EditorContext
            editorConfig={editorConfig}
            fieldProps={props}
            path={path}
            readOnly={readOnly}
            value={value}
            key={JSON.stringify({ initialValue, path })} // makes sure lexical is completely re-rendered when initialValue changes, bypassing the lexical-internal value memoization. That way, external changes to the form will update the editor. More infos in PR description (https://github.com/payloadcms/payload/pull/5010)
            // NOTE: 2023-05-15 disabled the deepEqual since we've set ignoreSelectionChange={true}
            // in our OnChangePlugin instances - and so a call here means that something
            // must have changed - so no need to do the comparison.
            onChange={(editorState: EditorState, editor: LexicalEditor, tags: Set<string>) => {
              if (!readOnly) {
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
        <FieldDescription description={description as string} />
      </div>
    </div>
  )
}

function fallbackRender({ error, resetErrorBoundary }: any): JSX.Element {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  return (
    <div className="errorBoundary" role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.message}</pre>
    </div>
  )
}

export default withCondition(RichText)
