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
import reloadIcon from '../assets/reload-16.svg'

export const DemoDescription = (props: Record<string, never>) => {
  return (
    <div class={'demo-page__description'}>
      <div class={'demo-description__header'}>
        <a href="https://www.yworks.com/products/yfiles">
          <div class={'demo-description__logo'} />
        </a>
      </div>
      <div class={'demo-description__content'}>
        <h1>Solid.js demo</h1>
        <p>
          This demo shows how to integrate yFiles in a{' '}
          <a href="https://www.solidjs.com/" target="_blank" rel="noopener noreferrer">
            SolidJS
          </a>{' '}
          application with{' '}
          <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
            TypeScript
          </a>{' '}
          in project bootstrapped with{' '}
          <a href="https://vitejs.dev/" target="_blank" rel="noopener noreferrer">
            Vite
          </a>
          .
        </p>
        <p>
          This application consists of separate components for the different parts, i.e. the yFiles{' '}
          <code>GraphComponent</code>, the toolbar and the sidebars.
        </p>
        <p>
          The nodes are rendered via the <code>SolidNodeTemplate</code> component class and the node
          labels via the <code>SolidLabelTemplate</code> component class.
        </p>
        <h2>Running the demo</h2>
        <p>
          The demo is using the <code>Vite</code> for tooling, thus the following steps are required
          to start it:
        </p>
        <code>
          &gt; npm install <br />
          &gt; npm run dev
        </code>
        <p>This will start the development server of the toolkit.</p>
        <h2>Things to Try</h2>
        <ul>
          <li>
            Clicking the buttons in the toolbar will execute certain actions in the SolidJS
            component for the diagram.
          </li>
          <li>
            After the graph has been changed, click <img src={reloadIcon} alt="reload-icon" /> to
            reload the initial sample graph.
          </li>
          <li>
            Vite's development server automatically updates the application upon code changes.
          </li>
        </ul>
        <h2>App Generator</h2>
        <p>
          Use the{' '}
          <a
            href="https://www.yworks.com/products/app-generator"
            target="_blank"
            rel="noopener noreferrer"
          >
            App Generator
          </a>{' '}
          to create visualization prototypes – quickly and easily.
        </p>
      </div>
    </div>
  )
}
