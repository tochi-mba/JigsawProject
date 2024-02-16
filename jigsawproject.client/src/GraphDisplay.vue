<template>
  <div style="width:70vw;">
    <div id="tree-container" ref="treeContainer">
      <div id="tree"></div>
    </div>
    <center>
    <div id="newNode">
      <h4>New Node:</h4>
      <label for="parentIdSelect">Parent ID:</label>
      <select id="parentIdSelect" v-model="newNode.parentId" class="nodeParentIdSidebar">
        <option value="0">0 - Root</option>
        <option v-for="node in sidebarData" :value="node.id" v-bind:key="node.id">
          {{ node.id }}
        </option>
      </select>
      <button @click="addNode">+</button>
    </div>
  </center>
    <div id="sidebar">
      <div class="nodeSidebar" v-for="node in sidebarData" :key="node.id">
        <h4 class="nodeIdSidebar">Node ID: {{ node.id }}</h4>
        <p class="nodeParentIdSidebar">Parent ID: {{ node.parentId }}</p>
      </div>
     
      
    </div>
    <button id="updateGraphBtn" @click="loadDataFromApiInit">Update Graph</button>
  </div>
</template>

<script>
import axios from 'axios';
import { TreeBuilder, License, GraphComponent, Size } from 'yfiles';
import { initializeTutorialDefaults, runLayout } from '../common.js'

export default {
  
  data() {
    return {
      graph: null,
      graphBuilder:null,
      rootNodesSource:null,
      sidebarData: null,
      newNode: {
        id: '',
        parentId: ''
      },
    };
  },
  mounted() {
    License.value = {
      comment: "c63bdd0d-b34e-4bfc-848c-90e6bc99e9f9",
      date: "02/15/2024",
      distribution: false,
      domains: [
        "*"
      ],
      expires: "04/16/2024",
      fileSystemAllowed: true,
      licensefileversion: "1.1",
      localhost: true,
      oobAllowed: true,
      package: "complete",
      product: "yFiles for HTML",
      type: "eval",
      version: "2.6",
      watermark: "yFiles HTML Evaluation License (expires in ${license-days-remaining} days)",
      key: "0699da574789fde1a23a532b6d0acd136c6a6d57"
    };
    this.loadDataFromApiInit();
  },
  methods: {
    initializeGraph(data){
        let container = document.getElementById("tree-container");

        //replace the old tree with a new tree div element
        while (container.firstChild) { 
          container.removeChild(container.firstChild);
        }
          
        let newDiv = document.createElement("div");
        newDiv.setAttribute("id", "tree");
        container.appendChild(newDiv);

        //update sidebar
        let sidebarData = [];

        const flattenData = data => {
          data.forEach(node => {
            sidebarData.push({
              id: node.id,
              parentId: node.parentId
            });
            if (node.children) {
              flattenData(node.children);
            }
          });
        };

        flattenData(data);
        this.sidebarData = sidebarData;


        const graphComponent = new GraphComponent('#tree')
        initializeTutorialDefaults(graphComponent)

        graphComponent.graph.nodeDefaults.size = new Size(200, 80)
        const treeBuilder = this.constructGraph(graphComponent.graph, data);
        this.graphBuilder = treeBuilder;
        this.graph = graphComponent.graph;

        treeBuilder.buildGraph()
        void runLayout(graphComponent)
    },
    
    loadDataFromApiInit() {
      axios.get('https://localhost:7151/api/Graph')
        .then(response => {
          console.log(response.data);
          this.initializeGraph(response.data);
        })
        .catch(error => {
          console.error('Error fetching data from API:', error);
        });
    },
    constructGraph(graph, nodesData) {
      const graphBuilder = new TreeBuilder(graph)

      const rootNodesSource = graphBuilder.createRootNodesSource(nodesData)

      rootNodesSource.addChildNodesSource((data) => data.children, rootNodesSource)

      this.rootNodesSource = rootNodesSource;

      rootNodesSource.nodeCreator.createLabelBinding({
        text: (dataItem) => dataItem.id
      })

      return graphBuilder
      
    },

    addNode() {
      const newNodeData = {
        id: this.newNode.id,
        parentId: this.newNode.parentId
      };

      this.sidebarData.push(newNodeData);

      this.newNode = { id: '', parentId: '' };

      document.getElementById("parentIdSelect").value = "";

      axios.post('https://localhost:7151/api/Graph', newNodeData)
        .then(response => {
          console.log('Node added successfully:', response.data);
          this.loadDataFromApiInit();
        })
        .catch(error => {
          console.error('Error adding node to API:', error);
        });
    },
  },
};
</script>

<style>
#tree-container {
  width: 70%;
  height: 400px;
  border: 1px solid #ccc;
  background-color: white;
  display: inline-block;
  position: relative;
  border-radius: 10px;
}

#sidebar {
  display: inline-block;
  width: 20%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0; 
  overflow-y: scroll;
}

#tree {
  width: 100%;
  height: 100%;
}

.nodeSidebar,#newNode,#updateGraphBtn,#newNode > button{
  border: solid grey 1px;
  margin:6px;
  background-color: #121212;
  border-radius: 10px;
  color:white;
}

#newNode,#updateGraphBtn{
  width:fit-content;
  padding:10px;
}

#updateGraphBtn{
  cursor:pointer;
}

#newNode > button{
  border-radius: 5px;

}
</style>
