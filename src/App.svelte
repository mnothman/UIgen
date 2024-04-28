<!-- <Header/> -->
<main>
  <Route path="/"><Home/></Route>
  <Route path="/view/:id" let:params><View {...params}/></Route>
  <Route path="/deleted"><DeletedItems/></Route>
</main>
<!-- <Sidebar/> -->

<script>
import {Route, router} from 'tinro'
// import Header from './Header.svelte'
// import Sidebar from './sidebar/Sidebar.svelte'
import Home from './Home.svelte'
import View from './View.svelte'
import DeletedItems from './DeletedItems.svelte';
</script>
