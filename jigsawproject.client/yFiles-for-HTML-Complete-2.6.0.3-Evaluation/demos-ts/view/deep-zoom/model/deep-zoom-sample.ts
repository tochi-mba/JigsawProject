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
export type DeepZoomNode = {
  id: number
  parentId?: number
  fill: string
  stroke: string
}

export type DeepZoomEdge = {
  from: number
  to: number
  color: string
}

export type DeepZoomData = {
  nodes: DeepZoomNode[]
  groupNodes: DeepZoomNode[]
  edges: DeepZoomEdge[]
}

export const sampleData: DeepZoomData = {
  nodes: [
    {
      id: 11,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 12,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 13,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 14,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 15,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 16,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 17,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 18,
      fill: '#ff6c00',
      stroke: '#662b00'
    },
    {
      id: 19,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 20,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 21,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 22,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 23,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 24,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 25,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 26,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 27,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 28,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 29,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 30,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 31,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 32,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 33,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 34,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 35,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 36,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 37,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 38,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 1
    },
    {
      id: 39,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 40,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 41,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 42,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 43,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 44,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 45,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 46,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 47,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 48,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 49,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 50,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 51,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 52,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 53,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 54,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 55,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 56,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 57,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 58,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 59,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 60,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 61,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 62,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 63,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 64,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 65,
      fill: '#ab2346',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 66,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 67,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 68,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 69,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 70,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 71,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 72,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 73,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 74,
      fill: '#4b7029',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 75,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 76,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 77,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 78,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 79,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 80,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 81,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 82,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 83,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 84,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 85,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 86,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 87,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 88,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 89,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 90,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 91,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 92,
      fill: '#ab2346',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 93,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 94,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 95,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 96,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 97,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 98,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 99,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 100,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 101,
      fill: '#662b00',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 102,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 103,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 104,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 105,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 106,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 107,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 108,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 109,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 110,
      fill: '#588230',
      stroke: '#242265',
      parentId: 9
    },
    {
      id: 111,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 112,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 113,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 114,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 115,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 116,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 117,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 118,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 119,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    },
    {
      id: 120,
      fill: '#0b7189',
      stroke: '#ab2346',
      parentId: 10
    }
  ],
  groupNodes: [
    {
      id: 0,
      fill: 'white',
      stroke: '#662b00'
    },
    {
      id: 1,
      fill: 'white',
      stroke: '#ab2346',
      parentId: 0
    },
    {
      id: 2,
      fill: 'white',
      stroke: '#662b00'
    },
    {
      id: 3,
      fill: 'white',
      stroke: '#2c4b52',
      parentId: 2
    },
    {
      id: 4,
      fill: 'white',
      stroke: '#ab2346',
      parentId: 3
    },
    {
      id: 5,
      fill: 'white',
      stroke: '#2f461a',
      parentId: 4
    },
    {
      id: 6,
      fill: 'white',
      stroke: '#242265',
      parentId: 5
    },
    {
      id: 7,
      fill: 'white',
      stroke: '#ab2346',
      parentId: 6
    },
    {
      id: 8,
      fill: 'white',
      stroke: '#662b00',
      parentId: 7
    },
    {
      id: 9,
      fill: 'white',
      stroke: '#2c4b52',
      parentId: 8
    },
    {
      id: 10,
      fill: 'white',
      stroke: '#242265',
      parentId: 9
    }
  ],
  edges: [
    {
      from: 15,
      to: 14,
      color: '#662b00'
    },
    {
      from: 0,
      to: 18,
      color: '#662b00'
    },
    {
      from: 16,
      to: 17,
      color: '#662b00'
    },
    {
      from: 13,
      to: 18,
      color: '#662b00'
    },
    {
      from: 16,
      to: 11,
      color: '#662b00'
    },
    {
      from: 14,
      to: 14,
      color: '#662b00'
    },
    {
      from: 2,
      to: 12,
      color: '#662b00'
    },
    {
      from: 2,
      to: 0,
      color: '#662b00'
    },
    {
      from: 2,
      to: 11,
      color: '#662b00'
    },
    {
      from: 12,
      to: 14,
      color: '#662b00'
    },
    {
      from: 12,
      to: 11,
      color: '#662b00'
    },
    {
      from: 17,
      to: 2,
      color: '#662b00'
    },
    {
      from: 0,
      to: 2,
      color: '#662b00'
    },
    {
      from: 11,
      to: 2,
      color: '#662b00'
    },
    {
      from: 18,
      to: 14,
      color: '#662b00'
    },
    {
      from: 18,
      to: 18,
      color: '#662b00'
    },
    {
      from: 13,
      to: 2,
      color: '#662b00'
    },
    {
      from: 15,
      to: 0,
      color: '#662b00'
    },
    {
      from: 17,
      to: 18,
      color: '#662b00'
    },
    {
      from: 2,
      to: 15,
      color: '#662b00'
    },
    {
      from: 44,
      to: 44,
      color: '#2c4b52'
    },
    {
      from: 41,
      to: 44,
      color: '#2c4b52'
    },
    {
      from: 44,
      to: 39,
      color: '#2c4b52'
    },
    {
      from: 44,
      to: 43,
      color: '#2c4b52'
    },
    {
      from: 46,
      to: 42,
      color: '#2c4b52'
    },
    {
      from: 39,
      to: 41,
      color: '#2c4b52'
    },
    {
      from: 46,
      to: 41,
      color: '#2c4b52'
    },
    {
      from: 45,
      to: 44,
      color: '#2c4b52'
    },
    {
      from: 39,
      to: 45,
      color: '#2c4b52'
    },
    {
      from: 43,
      to: 40,
      color: '#2c4b52'
    },
    {
      from: 47,
      to: 42,
      color: '#2c4b52'
    },
    {
      from: 44,
      to: 3,
      color: '#2c4b52'
    },
    {
      from: 39,
      to: 47,
      color: '#2c4b52'
    },
    {
      from: 42,
      to: 41,
      color: '#2c4b52'
    },
    {
      from: 40,
      to: 39,
      color: '#2c4b52'
    },
    {
      from: 3,
      to: 40,
      color: '#2c4b52'
    },
    {
      from: 44,
      to: 46,
      color: '#2c4b52'
    },
    {
      from: 47,
      to: 46,
      color: '#2c4b52'
    },
    {
      from: 45,
      to: 41,
      color: '#2c4b52'
    },
    {
      from: 41,
      to: 47,
      color: '#2c4b52'
    },
    {
      from: 54,
      to: 55,
      color: '#ab2346'
    },
    {
      from: 51,
      to: 49,
      color: '#ab2346'
    },
    {
      from: 50,
      to: 49,
      color: '#ab2346'
    },
    {
      from: 50,
      to: 54,
      color: '#ab2346'
    },
    {
      from: 55,
      to: 48,
      color: '#ab2346'
    },
    {
      from: 48,
      to: 50,
      color: '#ab2346'
    },
    {
      from: 4,
      to: 54,
      color: '#ab2346'
    },
    {
      from: 56,
      to: 50,
      color: '#ab2346'
    },
    {
      from: 48,
      to: 53,
      color: '#ab2346'
    },
    {
      from: 56,
      to: 52,
      color: '#ab2346'
    },
    {
      from: 56,
      to: 55,
      color: '#ab2346'
    },
    {
      from: 4,
      to: 55,
      color: '#ab2346'
    },
    {
      from: 54,
      to: 52,
      color: '#ab2346'
    },
    {
      from: 50,
      to: 55,
      color: '#ab2346'
    },
    {
      from: 53,
      to: 49,
      color: '#ab2346'
    },
    {
      from: 4,
      to: 50,
      color: '#ab2346'
    },
    {
      from: 48,
      to: 52,
      color: '#ab2346'
    },
    {
      from: 56,
      to: 4,
      color: '#ab2346'
    },
    {
      from: 48,
      to: 49,
      color: '#ab2346'
    },
    {
      from: 63,
      to: 60,
      color: '#2f461a'
    },
    {
      from: 62,
      to: 59,
      color: '#2f461a'
    },
    {
      from: 65,
      to: 59,
      color: '#2f461a'
    },
    {
      from: 58,
      to: 5,
      color: '#2f461a'
    },
    {
      from: 61,
      to: 58,
      color: '#2f461a'
    },
    {
      from: 57,
      to: 60,
      color: '#2f461a'
    },
    {
      from: 65,
      to: 57,
      color: '#2f461a'
    },
    {
      from: 64,
      to: 5,
      color: '#2f461a'
    },
    {
      from: 61,
      to: 64,
      color: '#2f461a'
    },
    {
      from: 5,
      to: 57,
      color: '#2f461a'
    },
    {
      from: 60,
      to: 64,
      color: '#2f461a'
    },
    {
      from: 63,
      to: 5,
      color: '#2f461a'
    },
    {
      from: 62,
      to: 61,
      color: '#2f461a'
    },
    {
      from: 63,
      to: 59,
      color: '#2f461a'
    },
    {
      from: 62,
      to: 58,
      color: '#2f461a'
    },
    {
      from: 57,
      to: 57,
      color: '#2f461a'
    },
    {
      from: 63,
      to: 61,
      color: '#2f461a'
    },
    {
      from: 57,
      to: 64,
      color: '#2f461a'
    },
    {
      from: 58,
      to: 65,
      color: '#2f461a'
    },
    {
      from: 65,
      to: 58,
      color: '#2f461a'
    },
    {
      from: 73,
      to: 71,
      color: '#242265'
    },
    {
      from: 73,
      to: 67,
      color: '#242265'
    },
    {
      from: 70,
      to: 66,
      color: '#242265'
    },
    {
      from: 66,
      to: 74,
      color: '#242265'
    },
    {
      from: 70,
      to: 71,
      color: '#242265'
    },
    {
      from: 6,
      to: 66,
      color: '#242265'
    },
    {
      from: 68,
      to: 70,
      color: '#242265'
    },
    {
      from: 68,
      to: 71,
      color: '#242265'
    },
    {
      from: 71,
      to: 69,
      color: '#242265'
    },
    {
      from: 74,
      to: 72,
      color: '#242265'
    },
    {
      from: 71,
      to: 73,
      color: '#242265'
    },
    {
      from: 73,
      to: 72,
      color: '#242265'
    },
    {
      from: 73,
      to: 74,
      color: '#242265'
    },
    {
      from: 69,
      to: 71,
      color: '#242265'
    },
    {
      from: 66,
      to: 73,
      color: '#242265'
    },
    {
      from: 71,
      to: 6,
      color: '#242265'
    },
    {
      from: 73,
      to: 66,
      color: '#242265'
    },
    {
      from: 71,
      to: 67,
      color: '#242265'
    },
    {
      from: 70,
      to: 74,
      color: '#242265'
    },
    {
      from: 66,
      to: 67,
      color: '#242265'
    },
    {
      from: 81,
      to: 80,
      color: '#ab2346'
    },
    {
      from: 81,
      to: 76,
      color: '#ab2346'
    },
    {
      from: 81,
      to: 81,
      color: '#ab2346'
    },
    {
      from: 76,
      to: 7,
      color: '#ab2346'
    },
    {
      from: 80,
      to: 80,
      color: '#ab2346'
    },
    {
      from: 80,
      to: 7,
      color: '#ab2346'
    },
    {
      from: 83,
      to: 7,
      color: '#ab2346'
    },
    {
      from: 77,
      to: 83,
      color: '#ab2346'
    },
    {
      from: 83,
      to: 82,
      color: '#ab2346'
    },
    {
      from: 82,
      to: 83,
      color: '#ab2346'
    },
    {
      from: 78,
      to: 81,
      color: '#ab2346'
    },
    {
      from: 82,
      to: 80,
      color: '#ab2346'
    },
    {
      from: 80,
      to: 81,
      color: '#ab2346'
    },
    {
      from: 79,
      to: 79,
      color: '#ab2346'
    },
    {
      from: 82,
      to: 82,
      color: '#ab2346'
    },
    {
      from: 80,
      to: 82,
      color: '#ab2346'
    },
    {
      from: 7,
      to: 83,
      color: '#ab2346'
    },
    {
      from: 80,
      to: 76,
      color: '#ab2346'
    },
    {
      from: 79,
      to: 82,
      color: '#ab2346'
    },
    {
      from: 79,
      to: 7,
      color: '#ab2346'
    },
    {
      from: 75,
      to: 76,
      color: '#ab2346'
    },
    {
      from: 84,
      to: 89,
      color: '#662b00'
    },
    {
      from: 8,
      to: 84,
      color: '#662b00'
    },
    {
      from: 89,
      to: 85,
      color: '#662b00'
    },
    {
      from: 91,
      to: 8,
      color: '#662b00'
    },
    {
      from: 86,
      to: 85,
      color: '#662b00'
    },
    {
      from: 92,
      to: 8,
      color: '#662b00'
    },
    {
      from: 89,
      to: 89,
      color: '#662b00'
    },
    {
      from: 88,
      to: 88,
      color: '#662b00'
    },
    {
      from: 8,
      to: 89,
      color: '#662b00'
    },
    {
      from: 88,
      to: 86,
      color: '#662b00'
    },
    {
      from: 89,
      to: 87,
      color: '#662b00'
    },
    {
      from: 89,
      to: 84,
      color: '#662b00'
    },
    {
      from: 92,
      to: 86,
      color: '#662b00'
    },
    {
      from: 8,
      to: 92,
      color: '#662b00'
    },
    {
      from: 90,
      to: 85,
      color: '#662b00'
    },
    {
      from: 87,
      to: 87,
      color: '#662b00'
    },
    {
      from: 90,
      to: 92,
      color: '#662b00'
    },
    {
      from: 91,
      to: 90,
      color: '#662b00'
    },
    {
      from: 84,
      to: 91,
      color: '#662b00'
    },
    {
      from: 8,
      to: 8,
      color: '#662b00'
    },
    {
      from: 94,
      to: 98,
      color: '#2c4b52'
    },
    {
      from: 97,
      to: 97,
      color: '#2c4b52'
    },
    {
      from: 98,
      to: 100,
      color: '#2c4b52'
    },
    {
      from: 9,
      to: 101,
      color: '#2c4b52'
    },
    {
      from: 101,
      to: 93,
      color: '#2c4b52'
    },
    {
      from: 97,
      to: 99,
      color: '#2c4b52'
    },
    {
      from: 101,
      to: 99,
      color: '#2c4b52'
    },
    {
      from: 100,
      to: 95,
      color: '#2c4b52'
    },
    {
      from: 96,
      to: 98,
      color: '#2c4b52'
    },
    {
      from: 99,
      to: 94,
      color: '#2c4b52'
    },
    {
      from: 94,
      to: 93,
      color: '#2c4b52'
    },
    {
      from: 99,
      to: 98,
      color: '#2c4b52'
    },
    {
      from: 98,
      to: 99,
      color: '#2c4b52'
    },
    {
      from: 9,
      to: 95,
      color: '#2c4b52'
    },
    {
      from: 9,
      to: 9,
      color: '#2c4b52'
    },
    {
      from: 93,
      to: 96,
      color: '#2c4b52'
    },
    {
      from: 95,
      to: 101,
      color: '#2c4b52'
    },
    {
      from: 100,
      to: 9,
      color: '#2c4b52'
    },
    {
      from: 96,
      to: 101,
      color: '#2c4b52'
    },
    {
      from: 106,
      to: 107,
      color: '#242265'
    },
    {
      from: 107,
      to: 102,
      color: '#242265'
    },
    {
      from: 105,
      to: 110,
      color: '#242265'
    },
    {
      from: 103,
      to: 103,
      color: '#242265'
    },
    {
      from: 108,
      to: 102,
      color: '#242265'
    },
    {
      from: 106,
      to: 109,
      color: '#242265'
    },
    {
      from: 102,
      to: 102,
      color: '#242265'
    },
    {
      from: 104,
      to: 102,
      color: '#242265'
    },
    {
      from: 107,
      to: 110,
      color: '#242265'
    },
    {
      from: 102,
      to: 109,
      color: '#242265'
    },
    {
      from: 102,
      to: 103,
      color: '#242265'
    },
    {
      from: 103,
      to: 109,
      color: '#242265'
    },
    {
      from: 103,
      to: 10,
      color: '#242265'
    },
    {
      from: 109,
      to: 105,
      color: '#242265'
    },
    {
      from: 108,
      to: 110,
      color: '#242265'
    },
    {
      from: 104,
      to: 110,
      color: '#242265'
    },
    {
      from: 106,
      to: 103,
      color: '#242265'
    },
    {
      from: 10,
      to: 108,
      color: '#242265'
    },
    {
      from: 102,
      to: 108,
      color: '#242265'
    },
    {
      from: 103,
      to: 106,
      color: '#242265'
    },
    {
      from: 116,
      to: 118,
      color: '#ab2346'
    },
    {
      from: 119,
      to: 112,
      color: '#ab2346'
    },
    {
      from: 115,
      to: 116,
      color: '#ab2346'
    },
    {
      from: 120,
      to: 115,
      color: '#ab2346'
    },
    {
      from: 112,
      to: 114,
      color: '#ab2346'
    },
    {
      from: 115,
      to: 114,
      color: '#ab2346'
    },
    {
      from: 117,
      to: 113,
      color: '#ab2346'
    },
    {
      from: 111,
      to: 113,
      color: '#ab2346'
    },
    {
      from: 119,
      to: 111,
      color: '#ab2346'
    },
    {
      from: 111,
      to: 115,
      color: '#ab2346'
    },
    {
      from: 116,
      to: 112,
      color: '#ab2346'
    },
    {
      from: 117,
      to: 118,
      color: '#ab2346'
    },
    {
      from: 111,
      to: 111,
      color: '#ab2346'
    },
    {
      from: 111,
      to: 117,
      color: '#ab2346'
    },
    {
      from: 112,
      to: 115,
      color: '#ab2346'
    },
    {
      from: 112,
      to: 111,
      color: '#ab2346'
    },
    {
      from: 114,
      to: 120,
      color: '#ab2346'
    },
    {
      from: 112,
      to: 112,
      color: '#ab2346'
    },
    {
      from: 116,
      to: 113,
      color: '#ab2346'
    },
    {
      from: 112,
      to: 119,
      color: '#ab2346'
    },
    {
      from: 20,
      to: 21,
      color: '#ab2346'
    },
    {
      from: 1,
      to: 19,
      color: '#ab2346'
    },
    {
      from: 19,
      to: 20,
      color: '#ab2346'
    },
    {
      from: 20,
      to: 1,
      color: '#ab2346'
    },
    {
      from: 21,
      to: 22,
      color: '#ab2346'
    },
    {
      from: 23,
      to: 22,
      color: '#ab2346'
    },
    {
      from: 24,
      to: 20,
      color: '#ab2346'
    },
    {
      from: 22,
      to: 21,
      color: '#ab2346'
    },
    {
      from: 1,
      to: 21,
      color: '#ab2346'
    },
    {
      from: 24,
      to: 23,
      color: '#ab2346'
    },
    {
      from: 22,
      to: 23,
      color: '#ab2346'
    },
    {
      from: 23,
      to: 24,
      color: '#ab2346'
    },
    {
      from: 20,
      to: 22,
      color: '#ab2346'
    },
    {
      from: 1,
      to: 26,
      color: '#ab2346'
    },
    {
      from: 26,
      to: 20,
      color: '#ab2346'
    },
    {
      from: 1,
      to: 25,
      color: '#ab2346'
    },
    {
      from: 25,
      to: 21,
      color: '#ab2346'
    },
    {
      from: 38,
      to: 34,
      color: '#2c4b52'
    },
    {
      from: 37,
      to: 34,
      color: '#2c4b52'
    },
    {
      from: 35,
      to: 33,
      color: '#2c4b52'
    },
    {
      from: 34,
      to: 33,
      color: '#2c4b52'
    },
    {
      from: 35,
      to: 34,
      color: '#2c4b52'
    },
    {
      from: 36,
      to: 33,
      color: '#2c4b52'
    },
    {
      from: 32,
      to: 37,
      color: '#2c4b52'
    },
    {
      from: 36,
      to: 32,
      color: '#2c4b52'
    },
    {
      from: 32,
      to: 31,
      color: '#2c4b52'
    },
    {
      from: 28,
      to: 32,
      color: '#2c4b52'
    },
    {
      from: 33,
      to: 29,
      color: '#2c4b52'
    },
    {
      from: 33,
      to: 32,
      color: '#2c4b52'
    },
    {
      from: 28,
      to: 33,
      color: '#2c4b52'
    },
    {
      from: 27,
      to: 28,
      color: '#2c4b52'
    },
    {
      from: 30,
      to: 35,
      color: '#2c4b52'
    },
    {
      from: 30,
      to: 33,
      color: '#2c4b52'
    },
    {
      from: 16,
      to: 13,
      color: '#662b00'
    }
  ]
}
