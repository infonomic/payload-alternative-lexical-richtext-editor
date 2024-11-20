import React, { useEffect, useState, useRef, useMemo } from 'react'

import { Drawer } from '@payloadcms/ui'
import { Button } from '@payloadcms/ui'
import { Form } from '@payloadcms/ui'
import { RenderFields } from '@payloadcms/ui'
import { FormSubmit } from '@payloadcms/ui'
import { useTranslation } from '@payloadcms/ui'
import { useConfig } from '@payloadcms/ui'

import { getFields, getInitialState, validateFields } from './fields'

import { v4 as uuid } from 'uuid'

import type { LinkDrawerProps, LinkData } from './types'
import type { FormState } from 'payload'

import './link-drawer.css'

const baseClass = 'rich-text-link-edit-modal'

export const LinkDrawer: React.FC<LinkDrawerProps> = ({
  isOpen,
  drawerSlug,
  onSubmit,
  onClose,
  data: dataFromProps
}) => {
  const { t } = useTranslation()
  const { config } = useConfig()
  const [synchronizedFormState, setSynchronizedFormState] = useState<FormState | undefined>(
    undefined
  )
  const version = useRef<string>(uuid())

  // NOTE: enableRichTextLink is currently true by default for all collections
  // and so we need to check for both enableRichTextLink and hidden. For example
  // payload-preferences and payload-migrations have enableRichTextLink: true 🫨.
  const validRelationships: string[] = useMemo(() => {
    const results: string[] = []
    for (const c of config.collections) {
      if (
        c?.admin?.enableRichTextLink === true &&
        // (c?.admin?.hidden == null || c?.admin?.hidden === false) &&
        c?.slug != 'payload-preferences' &&
        c?.slug != 'payload-migrations'
      ) {
        results.push(c.slug)
      }
    }
    return results
  }, [config])

  const handleOnCancel = (): void => {
    setSynchronizedFormState(undefined)
    onClose()
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
        const doc = data.doc as { value: string; relationTo: string }
        const submitData: LinkData = {
          text: data.text as string,
          fields: {
            url: data.url as string,
            newTab: data.newTab as boolean,
            doc: {
              value: doc.value,
              relationTo: doc.relationTo,
              data: {}
            },
            linkType: data.linkType === 'custom' ? 'custom' : 'internal'
          }
        }
        onSubmit(submitData)
      }
      setSynchronizedFormState(undefined)
      onClose()
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
    <Drawer slug={drawerSlug} className={baseClass} title={t('fields:editLink') ?? ''}>
      <Form
        initialState={synchronizedFormState}
        onChange={[handleFormOnChange]}
        onSubmit={handleFormOnSubmit}
        uuid={uuid()}
      >
        <RenderFields
          fields={getFields(synchronizedFormState, validRelationships)}
          forceRender
          parentSchemaPath=""
          parentPath=""
          parentIndexPath=""
          permissions={true}
          readOnly={false}
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
