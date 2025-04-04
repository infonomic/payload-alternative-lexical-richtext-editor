import { type CollectionConfig } from 'payload'

import { isAdmin, isAdminOrEditor, publishedOnly } from '@/payload/access'
import { editor } from '@/payload/fields/editor'
import { publishedOn } from '@/payload/fields/published-on'
import { PhotoBlock } from '@/payload/blocks/photo'
import { RichTextBlock } from '@/payload/blocks/richtext'
import { slugField } from '@/payload/fields/slug'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    enableRichTextLink: true,
    defaultColumns: ['title', 'publishedOn', '_status'],
    useAsTitle: 'title',
    group: 'Content',
    preview: (doc, { locale }) => {
      if (doc?.slug != null) {
        return `http://localhost:3000/${doc.slug as string}?locale=${locale}`
      }
      return null
    },
  },
  defaultSort: '-publishedOn',
  versions: {
    drafts: true,
    maxPerDoc: 5
  },
  labels: {
    singular: 'Page',
    plural: 'Pages'
  },
  access: {
    create: isAdminOrEditor,
    read: publishedOnly,
    readVersions: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin
  },
  
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Details',
          fields: [
            {
              name: 'title',
              type: 'text',
              localized: true,
              required: true
            },
            {
              name: 'sub',
              type: 'textarea',
              localized: true,
              admin: {
                description: "Optionally enter a sub-title, sub-tag, or 'lead' for this page."
              }
            },
            {
              name: 'options',
              label: 'Options',
              type: 'group',
              fields: [
                {
                  name: 'display', // required
                  type: 'select', // required
                  hasMany: false,
                  defaultValue: 'full_hero',
                  admin: {
                    isClearable: false,
                    description:
                      'Choose how this page will be displayed. In "Full Hero" mode, either the feature image, or a default image will be displayed at "full hero" height. Section Header mode will also display the feature image, or a default image, but at a reduced "section header" height.'
                  },
                  options: [
                    {
                      label: 'Full Hero',
                      value: 'full_hero'
                    },
                    {
                      label: 'Reduced Hero',
                      value: 'reduced_hero'
                    },
                    {
                      label: 'Normal Page',
                      value: 'normal_page'
                    }
                  ]
                },
                {
                  name: 'showBreadcrumbs',
                  label: 'Show Breadcrumbs',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Check to show the breadcrumb navigation at the top of this page.'
                  }
                },
                {
                  name: 'showAvailableLanguages',
                  label: 'Show the Available Languages widget',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Check to show the available languages widget.'
                  }
                },
                {
                  name: 'showSocialShare',
                  label: 'Show SocialShare',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Check to show the social media share widget.'
                  }
                }
              ]
            }
          ]
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'blocks',
              blocks: [
                RichTextBlock,
                PhotoBlock,
              ],
              required: true
            }
          ]
        }
      ]
    },
    slugField(),
    publishedOn(),
    editor()
  ]
}
