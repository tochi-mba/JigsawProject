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
/**
 * @typedef {Object} GroupBucket
 * @property {'group'} type
 * @property {GroupBucket.<TDataItem>} [parent]
 * @property {Array.<Bucket.<TDataItem>>} children
 * @property {number} layer
 * @property {number} [index]
 * @property {number} indexInLayer
 * @property {Date} start
 * @property {Date} end
 * @property {string} [label]
 * @property {number} aggregatedValue
 */

/**
 * @typedef {Object} LeafBucket
 * @property {'leaf'} type
 * @property {GroupBucket.<TDataItem>} [parent]
 * @property {TDataItem} item
 * @property {number} layer
 * @property {number} [index]
 * @property {number} indexInLayer
 * @property {Date} start
 * @property {Date} end
 * @property {string} [label]
 * @property {number} aggregatedValue
 */

/**
 * The bar-chart buckets.
 * @typedef {(GroupBucket.<TDataItem>|LeafBucket.<TDataItem>)} Bucket
 */

/**
 * Returns the bucket that is represented be the given node.
 * @template TDataItem
 * @param {!INode} node
 * @returns {!Bucket.<TDataItem>}
 */
export function getBucket(node) {
  return node.tag
}

/**
 * Extracts the business data items from the group node.
 * Each bucket is a group node that eventually contains leaf nodes in the graph model that actually hold the business
 * data items.
 * @template TDataItem
 * @param {!INode} bucketNode
 * @returns {!Array.<TDataItem>}
 */
export function getItemsFromBucket(bucketNode) {
  return getLeaves(getBucket(bucketNode))
}

/**
 * Aggregates buckets from the given data items.
 * @param {!Array.<TDataItem>} items The items that need to be sorted in buckets
 * @param {!function} getTimeEntry A mapping from data items to TimeEntry
 * @param {!Array.<function>} granularities Granularity functions that produce different detail levels
 * @template TDataItem
 * @returns {!Array.<Bucket.<TDataItem>>}
 */
export function aggregateBuckets(items, getTimeEntry, granularities) {
  let currentLevel = collectLeafBuckets(items, getTimeEntry)
  const allNonLeafBuckets = []

  let layer = 1
  for (const granularity of granularities) {
    currentLevel = aggregateBucketsCore(currentLevel, granularity, allNonLeafBuckets, layer)
    layer++
  }

  return allNonLeafBuckets
}

/**
 * Aggregates the buckets for a specific detail level.
 * @template TDataItem
 * @param {!Array.<Bucket.<TDataItem>>} buckets
 * @param {!function} iterateTimeSlices
 * @param {!Array.<Bucket.<TDataItem>>} allBuckets
 * @param {number} layer
 * @returns {!Array.<Bucket.<TDataItem>>}
 */
function aggregateBucketsCore(buckets, iterateTimeSlices, allBuckets, layer) {
  if (buckets.length === 0) {
    return []
  }

  const minDate = buckets[0].start
  const maxDate = buckets[buckets.length - 1].end

  const newBuckets = []
  const activeBuckets = new Set()
  let bucketIndex = 0
  for (const [start, end, label] of iterateTimeSlices(minDate, maxDate)) {
    const childBuckets = []
    for (; bucketIndex < buckets.length && buckets[bucketIndex].start < end; bucketIndex++) {
      const entry = buckets[bucketIndex]
      activeBuckets.add(entry)
    }

    for (const bucket of Array.from(activeBuckets)) {
      if (start <= bucket.start && bucket.end <= end) {
        childBuckets.push(bucket)
      } else {
        activeBuckets.delete(bucket)
      }
    }

    const bucket = {
      type: 'group',
      start,
      end,
      children: childBuckets,
      label,
      aggregatedValue: 1,
      layer,
      indexInLayer: -1
    }
    let aggregatedValue = 0
    bucket.children.forEach((child, i) => {
      child.parent = bucket
      child.index = i
      aggregatedValue += child.aggregatedValue
    })
    bucket.aggregatedValue = aggregatedValue

    newBuckets.push(bucket)
    allBuckets.push(bucket)
  }

  for (let i = 0; i < newBuckets.length; i++) {
    newBuckets[i].indexInLayer = i
  }

  return newBuckets
}

/**
 * @template TDataItem
 * @param {!TDataItem} item
 * @param {!Date} start
 * @param {!Date} end
 * @returns {!Array.<Bucket.<TDataItem>>}
 */
function createIntervalBuckets(item, start, end) {
  const buckets = []
  let currentDate = new Date(start)
  const intervalLabel = `${start.toDateString()} - ${end.toDateString()}`
  while (currentDate <= end) {
    buckets.push(createLeafBucket(item, intervalLabel, currentDate, currentDate))
    const nextDate = currentDate.setDate(currentDate.getDate() + 1)
    currentDate = new Date(nextDate)
  }
  return buckets
}

/**
 * @template TDataItem
 * @param {!TDataItem} item
 * @param {!string} label
 * @param {!Date} start
 * @param {!Date} end
 * @returns {!Bucket.<TDataItem>}
 */
function createLeafBucket(item, label, start, end) {
  return {
    type: 'leaf',
    item,
    start,
    end,
    label,
    aggregatedValue: 1,
    layer: 0,
    indexInLayer: -1
  }
}

/**
 * @template TDataItem
 * @param {!Array.<TDataItem>} items
 * @param {!function} getTimeEntry
 * @returns {!Array.<Bucket.<TDataItem>>}
 */
function collectLeafBuckets(items, getTimeEntry) {
  const entries = items.flatMap((item) => {
    const timeEntry = getTimeEntry(item)
    if (timeEntry) {
      if (Array.isArray(timeEntry)) {
        return timeEntry.flatMap((entry) => {
          if (typeof entry === 'number') {
            const date = new Date(entry)
            return createLeafBucket(item, `${date.getHours()}:${date.getMinutes()}`, date, date)
          } else if (entry.start !== undefined && entry.end !== undefined) {
            return createIntervalBuckets(item, new Date(entry.start), new Date(entry.end))
          }
          return []
        })
      } else if (timeEntry.start !== undefined && timeEntry.end !== undefined) {
        return createIntervalBuckets(item, new Date(timeEntry.start), new Date(timeEntry.end))
      }
    }
    return []
  })

  entries.sort((a, b) => a.start.getTime() - b.start.getTime())
  for (let i = 0; i < entries.length; i++) {
    entries[i].indexInLayer = i
  }
  return entries
}

/**
 * Obtains all leaf items in the given bucket.
 * @template TDataItem
 * @param {!Bucket.<TDataItem>} bucket
 * @returns {!Array.<TDataItem>}
 */
function getLeaves(bucket) {
  if (bucket.type === 'leaf') {
    return [bucket.item]
  } else {
    return bucket.children.flatMap((child) => getLeaves(child))
  }
}
