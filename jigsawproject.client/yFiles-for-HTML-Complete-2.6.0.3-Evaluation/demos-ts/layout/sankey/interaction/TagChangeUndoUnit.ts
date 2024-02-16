/****************************************************************************
 ** @license
 ** This demo file is part of yFiles for HTML 2.6.0.3.
 ** Copyright (c) 2000-2024 by yWorks GmbH, Vor dem Kreuzberg 28,
 ** 72070 Tuebingen, Germany. All rights reserved.
 **
 ** yFiles demo files exhibit yFiles for HTML functionalities. Any redistribution
 ** of demo files in source code or binary form, with or without
 ** modification, is not permitted.
 **
 ** Owners of a valid software license for a yFiles for HTML version that this
 ** demo is shipped with are allowed to use the demo source code as basis
 ** for their own yFiles for HTML powered applications. Use of such programs is
 ** governed by the rights and conditions as set out in the yFiles for HTML
 ** license agreement.
 **
 ** THIS SOFTWARE IS PROVIDED ''AS IS'' AND ANY EXPRESS OR IMPLIED
 ** WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 ** MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
 ** NO EVENT SHALL yWorks BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 ** SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 ** TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 ** PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 ** LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 ** NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 ** SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **
 ***************************************************************************/
import { type IModelItem, UndoUnitBase } from 'yfiles'

/**
 * This class provides undo/redo for an operation for changing tag data.
 * Since information about node/edge color and edge thickness is stored in the item's tag, it is
 * important to undo these changes along with the changes in style and layout.
 */
export class TagChangeUndoUnit extends UndoUnitBase {
  /**
   * Creates a new instance of TagChangeUndoUnit.
   * @param undoName Name of the undo operation.
   * @param redoName Name of the redo operation.
   * @param oldTag The data needed to restore the previous state.
   * @param newTag The data needed to restore the next state.
   * @param item The owner of the tag.
   * @param undoRedoCallback Callback that is executed after undo and redo.
   */
  constructor(
    undoName: string,
    redoName: string,
    private readonly oldTag: object,
    private readonly newTag: object,
    private readonly item: IModelItem,
    private readonly undoRedoCallback?: () => void | null
  ) {
    super(undoName, redoName)
  }

  /**
   * Undoes the work that is represented by this unit.
   */
  undo(): void {
    this.item.tag = this.oldTag
    this.undoRedoCallback?.()
  }

  /**
   * Redoes the work that is represented by this unit.
   */
  redo(): void {
    this.item.tag = this.newTag
    this.undoRedoCallback?.()
  }
}
