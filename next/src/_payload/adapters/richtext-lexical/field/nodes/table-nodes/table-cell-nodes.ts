/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { HashtagNode } from '@lexical/hashtag'
import { ListItemNode, ListNode } from '@lexical/list'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'

// import {AutocompleteNode} from './AutocompleteNode'
import { AutoLinkNode, LinkNode } from '../link-nodes-payload'

import type { Klass, LexicalNode } from 'lexical'
// import {EquationNode} from './EquationNode'
// import {ImageNode} from './ImageNode'
// import {KeywordNode} from './KeywordNode'
// import {MentionNode} from './MentionNode'

const LexicalNodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode
  // ImageNode,
  // MentionNode,
  // EquationNode,
  // AutocompleteNode,
  // KeywordNode,
]

export default LexicalNodes
