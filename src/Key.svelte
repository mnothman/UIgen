<input type="text">

<script>
import {state, init_openai} from './store.js'

function on_submit(api_key) {
    $state.api_key = api_key
    init_openai()
    
}
</script>
