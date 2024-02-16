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
import { EventArgs, ICommand } from 'yfiles'

/**
 * Binds the given command to the element specified by the given selector.
 *
 * In more detail, register a click listener that executes the command and an event listener that
 * syncs the disabled state of the command to the button.
 */

export function bindYFilesCommand(
  selector: string,
  command: ICommand,
  target: any,
  parameter: any,
  tooltip: string
): void {
  const element = document.querySelector(selector)
  // Check whether an event listener is already registered
  if (!element || element.getAttribute('data-command-registered')) {
    return
  }

  // Add a click listener that executes the command
  element.addEventListener('click', () => {
    if (command.canExecute(parameter, target)) {
      command.execute(parameter, target)
    }
  })

  // Add an event listener that syncs the disabled state of the command to the element
  command.addCanExecuteChangedListener((command: ICommand, _evt: EventArgs) => {
    if (command.canExecute(parameter, target)) {
      element.removeAttribute('disabled')
    } else {
      element.setAttribute('disabled', 'disabled')
    }
  })

  // Mark the element as having an event listener, and add a tooltip
  element.setAttribute('data-command-registered', '')
  element.setAttribute('title', tooltip)
}
