'use client'
import React, { useEffect, useState, useRef } from 'react'

import { Drawer, documentDrawerBaseClass } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { Form } from '@payloadcms/ui'
import { RenderFields } from '@payloadcms/ui'
import { FormSubmit } from '@payloadcms/ui'
import { useTranslation } from '@payloadcms/ui'
import { v4 as uuid } from 'uuid'
import { getInitialState, getFields, validateFields } from './fields'
import { useModal } from '@payloadcms/ui'

import type { AdmonitionDrawerProps } from './types'
import type { AdmonitionType } from '../../nodes/admonition-node/types'
import type { FormState } from 'payload'

import './admonition-drawer.css'

export function AdmonitionDrawer({
  isOpen,
  drawerSlug,
  onSubmit,
  data: dataFromProps
}: AdmonitionDrawerProps): React.ReactNode {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const [synchronizedFormState, setSynchronizedFormState] = useState<FormState | undefined>(
    undefined
  )
  const version = useRef<string>(uuid())

  const handleOnCancel = (): void => {
    setSynchronizedFormState(undefined)
    closeModal(drawerSlug)
  }

  async function handleFormOnChange({ formState }: { formState: FormState }): Promise<FormState> {
    return new Promise((resolve, reject) => {
      if (version.current !== formState.version.value) {
        const { fields } = validateFields(formState)
        formState.version.value = version.current = uuid()
        setSynchronizedFormState(fields)
      } else {
        version.current = uuid()
      }
      resolve(formState)
    })
  }

  const handleFormOnSubmit = (fields: FormState, data: Record<string, unknown>): void => {
    const { valid, fields: formState } = validateFields(fields)
    if (valid === false) {
      setSynchronizedFormState(formState)
    } else {
      if (onSubmit != null) {
        onSubmit({
          admonitionType: data.admonitionType as AdmonitionType,
          title: data.title as string
        })
        setSynchronizedFormState(undefined)
      }
      closeModal(drawerSlug)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (synchronizedFormState == null && isOpen === true) {
      const formState = getInitialState(dataFromProps)
      setSynchronizedFormState(formState)
    }
  })

  return (
    <Drawer
      slug={drawerSlug}
      key={drawerSlug}
      className={documentDrawerBaseClass}
      title="Admonition"
    >
      <Form
        initialState={synchronizedFormState}
        onChange={[handleFormOnChange]}
        onSubmit={handleFormOnSubmit}
        uuid={uuid()}
      >
        <RenderFields
          fields={getFields(synchronizedFormState)}
          forceRender
          readOnly={false}
          parentSchemaPath=""
          parentPath=""
          parentIndexPath=""
          permissions={true}
        />
        <div className="link-plugin--modal-actions" data-test-id="link-plugin-model-actions">
          <FormSubmit>{t('general:save')}</FormSubmit>
          <Button buttonStyle="secondary" onClick={handleOnCancel}>
            {t('general:cancel')}
          </Button>
        </div>
      </Form>
    </Drawer>
  )
}
