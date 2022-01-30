<script lang="ts">
  import DataTable, { Head, Body, Row, Cell, Pagination } from '@smui/data-table';
  import IconButton from '@smui/icon-button';
  import LinearProgress from '@smui/linear-progress';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Select, { Option } from '@smui/select';
  import { Input } from '@smui/textfield';
  import Paper from '@smui/paper';
  import Icon from '@smui/textfield/icon';
  import { Label } from '@smui/common';

  import { onMount } from 'svelte';

  import { createClient, setClient } from '@urql/svelte';
  import { operationStore, query } from '@urql/svelte';
  import type { Aavegotchi } from '../types/aavegotchi';
  import { aavegotchisQuery } from '../queries/aavegotchis';

  const client = createClient({
    url: 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
  });
  setClient(client);

  const todos = operationStore<unknown, unknown, {aavegotchis: Aavegotchi[]}>(aavegotchisQuery);
  query(todos);

  const getOwnerId = (id: string) => {
    return id ? `${id.slice(0, 6)}...${id.slice(-4)}` : ''
  }

  let navigator: Navigator;

  onMount(() => {
    navigator = window.navigator
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  let loaded = false;
  let search = '';
  let items: Aavegotchi[] = [];
  let rowsPerPage = 15;
  let currentPage = 0;
  let lastPage;
  let debounceTimer;

  $: if (!$todos.fetching) {
    loaded = true
  }

  $: if ($todos.data) {
    items = todos.data.aavegotchis
  }
  $: slice = items.slice(start, end).filter(({name}) => {
    return name.toLowerCase().includes(search)
  });
  $: start = currentPage * rowsPerPage;
  $: end = Math.min(start + rowsPerPage, items.length);
  $: lastPage = Math.max(Math.ceil(items.length / rowsPerPage) - 1, 0);

  $: if (currentPage > lastPage) {
    currentPage = lastPage;
  }

  const handleSearch = (event: KeyboardEvent) => {
    clearTimeout(debounceTimer);
    const target = event.target as HTMLInputElement
    debounceTimer = setTimeout(() => {
      search = target.value.toLowerCase()
    }, 300);
  }
</script>

<div class="pb-4 w-[250px]">
    <Paper class="flex p-2" elevation={3}>
        <Icon class="material-icons p-0 pr-2">search</Icon>
        <Input bind:search on:keyup={handleSearch} placeholder="Search"/>
    </Paper>
</div>
<DataTable class={loaded ? 'w-full max-h-[80vh]' : 'w-full'}>
    <Head>
        <Row>
            <Cell>Name</Cell>
            <Cell>Level</Cell>
            <Cell>Owner</Cell>
            <Cell>AGG 👹</Cell>
            <Cell>NRG ⚡</Cell>
            <Cell>SPK 👻</Cell>
            <Cell>BRN 🧠</Cell>
            <Cell>EYS 👀</Cell>
            <Cell>EYC 👁</Cell>
            <Cell>Kinship</Cell>
            <Cell>Experience</Cell>
            <Cell>Rarity Score</Cell>
        </Row>
    </Head>
        <Body>
        {#each slice as gotchi (gotchi.gotchiId)}
            <Row>
                <Cell style="min-width: 100px; max-width: 100px;">{gotchi.name}</Cell>
                <Cell>{gotchi.level}</Cell>
                <Wrapper>
                    <Cell on:click={() => copyToClipboard(gotchi.owner.id)} class="cursor-pointer">
                        {getOwnerId(gotchi.owner?.id)}
                    </Cell>
                    <Tooltip unbounded>Click to copy</Tooltip>
                </Wrapper>
                <Cell>{gotchi.numericTraits[0]}</Cell>
                <Cell>{gotchi.numericTraits[1]}</Cell>
                <Cell>{gotchi.numericTraits[2]}</Cell>
                <Cell>{gotchi.numericTraits[3]}</Cell>
                <Cell>{gotchi.numericTraits[4]}</Cell>
                <Cell>{gotchi.numericTraits[5]}</Cell>
                <Cell>{gotchi.kinship}</Cell>
                <Cell>{gotchi.experience}</Cell>
                <Cell>{gotchi.modifiedRarityScore}</Cell>
            </Row>
        {/each}
    </Body>
    <LinearProgress
            indeterminate
            bind:closed={loaded}
            slot="progress"
    />
    <Pagination slot="paginate">
        <svelte:fragment slot="rowsPerPage">
            <Label>Rows Per Page</Label>
            <Select variant="outlined" bind:value={rowsPerPage} noLabel>
                <Option value={15}>15</Option>
                <Option value={30}>30</Option>
                <Option value={100}>100</Option>
            </Select>
        </svelte:fragment>
        <svelte:fragment slot="total">
            {start + 1}-{end} of {items.length}
        </svelte:fragment>
        <IconButton
                class="material-icons"
                action="first-page"
                title="First page"
                on:click={() => (currentPage = 0)}
                disabled={currentPage === 0}>first_page</IconButton
        >
        <IconButton
                class="material-icons"
                action="prev-page"
                title="Prev page"
                on:click={() => currentPage--}
                disabled={currentPage === 0}>chevron_left</IconButton
        >
        <IconButton
                class="material-icons"
                action="next-page"
                title="Next page"
                on:click={() => currentPage++}
                disabled={currentPage === lastPage}>chevron_right</IconButton
        >
        <IconButton
                class="material-icons"
                action="last-page"
                title="Last page"
                on:click={() => (currentPage = lastPage)}
                disabled={currentPage === lastPage}>last_page</IconButton
        >
    </Pagination>
</DataTable>
