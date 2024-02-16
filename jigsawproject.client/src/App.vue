<template>
  <div id="app">
    <header>
    </header>
    <main>
      <GraphComponent />
    </main>
  </div>
</template>

<script>
import GraphComponent from "./GraphDisplay.vue";

export default {
  name: "App",
  components: {
    GraphComponent,
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

main {
  margin: 0px;
}
</style>
