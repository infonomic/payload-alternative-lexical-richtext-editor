'use client'
/**
 * Copyright (c) 2024 Infonomic Co., Ltd. info@infonomic.io
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import React, { useEffect, useState, useRef } from 'react'

import { Drawer } from '@payloadcms/ui/elements'
import { baseClass } from '@payloadcms/ui/elements/DocumentDrawer'
import { Button } from '@payloadcms/ui/elements'
import { Form } from '@payloadcms/ui/forms/Form'
import { RenderFields } from '@payloadcms/ui/forms/RenderFields'
import { FormSubmit } from '@payloadcms/ui/forms/Submit'
import { useTranslation } from '@payloadcms/ui/providers/Translation'
import { v4 as uuid } from 'uuid'
import { getInitialState, getMappedFields, validateFields } from './fields'
import { useModal } from '@payloadcms/ui/elements/Modal'

import type { AdmonitionDrawerProps } from './types'
import type { AdmonitionType } from '../../nodes/admonition-node/types'
import type { FormState } from 'payload/types'

import './admonition-drawer.css'

export function AdmonitionDrawer({
  isOpen,
  drawerSlug,
  onSubmit,
  data: dataFromProps,
}: AdmonitionDrawerProps): React.ReactNode {
  const { t } = useTranslation()
  const { closeModal } = useModal()
  const [synchronizedFormState, setSynchronizedFormState] = useState<FormState | undefined>(
    undefined,
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
          title: data.title as string,
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
    <Drawer slug={drawerSlug} key={drawerSlug} className={baseClass} title="Admonition">
      <Form
        initialState={synchronizedFormState}
        onChange={[handleFormOnChange]}
        onSubmit={handleFormOnSubmit}
        uuid={uuid()}
      >
        <RenderFields
          fieldMap={getMappedFields(synchronizedFormState)}
          forceRender
          path=""
          readOnly={false}
          schemaPath="admonition-drawer-schema-map"
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
