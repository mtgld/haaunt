<script lang="ts">
  import DataTable, { Body, Cell, Head, Pagination, Row, SortValue } from '@smui/data-table';
  import IconButton from '@smui/icon-button';
  import LinearProgress from '@smui/linear-progress';
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Select, { Option } from '@smui/select';
  import { Input } from '@smui/textfield';
  import Paper from '@smui/paper';
  import Icon from '@smui/textfield/icon';
  import { Label } from '@smui/common';
  import Button, { Label as ButtonLabel } from '@smui/button';

  import { createClient, operationStore, query, setClient } from '@urql/svelte';
  import type { Aavegotchi } from '../types/aavegotchi';
  import { aavegotchisQuery } from '../queries/aavegotchis';
  import { aavegotchisByOwnerQuery } from '../queries/aavegotchisByOwner';

  const client = createClient({
    url: 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
  });
  setClient(client);

  const aavegotchis = operationStore<unknown, unknown, {aavegotchis: Aavegotchi[]}>(aavegotchisQuery, {skip: 0, orderd: 'asc'});
  const aavegotchisByOwner = operationStore<unknown, unknown, {aavegotchis: Aavegotchi[]}>(aavegotchisByOwnerQuery, {}, {pause: true})
  query(aavegotchisByOwner)
  query(aavegotchis);

  const getAavegotchisByOwner = (owner: string) => {
    ownerId = owner
  }

  const reset = () => {
    ownerId = null;
    loaded = false;
    $aavegotchis.reexecute()
  }

  const getOwnerId = (id: string) => {
    return id ? `${id.slice(0, 6)}...${id.slice(-4)}` : ''
  }

  let loaded = false;
  let ownerId: string | null = null;
  let search = '';
  let skip = 0;
  let orderd: 'asc' | 'desc' = 'asc';
  let items: Aavegotchi[] = [];
  let rowsPerPage = 15;
  let currentPage = 0;
  let lastPage;
  let debounceTimer;
  let sort: keyof Aavegotchi = 'gotchiId';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

  const fetchMore = () => {
    skip += 1000
    $aavegotchis.variables = {...$aavegotchis.variables, skip, orderd}
    $aavegotchis.reexecute()
  }


  $: if (!$aavegotchis.fetching) {
    loaded = true
  }
  $: if (!$aavegotchisByOwner.fetching && ownerId) {
    loaded = true
  }

  $: if (ownerId) {
    loaded = false;
    $aavegotchisByOwner.variables = {owner: ownerId}
    $aavegotchisByOwner.context.pause = false;
    $aavegotchisByOwner.reexecute();
  }

  $: if ($aavegotchis.data) {
    items = [...items, ...$aavegotchis.data.aavegotchis.map((gotchi) => {
      return {
        ...gotchi,
        energy: gotchi.numericTraits[0],
        aggression: gotchi.numericTraits[1],
        spookiness: gotchi.numericTraits[2],
        brain: gotchi.numericTraits[3],
        eys: gotchi.numericTraits[4],
        eyc: gotchi.numericTraits[5],
      }
    })]
    if ($aavegotchis.data.aavegotchis.length) {
      fetchMore()
    }
  }

  $: if ($aavegotchisByOwner.data) {
    items = $aavegotchisByOwner.data.aavegotchis.map((gotchi) => {
      return {
        ...gotchi,
        energy: gotchi.numericTraits[0],
        aggression: gotchi.numericTraits[1],
        spookiness: gotchi.numericTraits[2],
        brain: gotchi.numericTraits[3],
        eys: gotchi.numericTraits[4],
        eyc: gotchi.numericTraits[5],
      }
    })
  }

  $: slice = items.slice(start, end)
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
  const handleSort = () => {
    items = items.sort((a, b) => {
      const [aVal, bVal] = [a[sort], b[sort]][
        sortDirection === 'ascending' ? 'slice' : 'reverse'
        ]();
      switch (sort) {
        case 'name':
          return (aVal as string).localeCompare(bVal as string);
        case 'owner':
          break;
        default:
          return Number(aVal) - Number(bVal);
      }
    });
  };
</script>

<div class="pb-4 w-full flex items-center">
    <Paper class="flex p-2" elevation={3}>
        <Icon class="material-icons p-0 pr-2">search</Icon>
        <Input bind:search on:keyup={handleSearch} placeholder="Search"/>
    </Paper>
    {#if ownerId}
        <Button class="ml-4" on:click={() => reset()} variant="outlined">
            <ButtonLabel>Reset</ButtonLabel>
        </Button>
    {/if}
</div>
<div class="overflow-hidden">
    <DataTable sortable
               bind:sort
               bind:sortDirection
               on:SMUIDataTable:sorted={handleSort}
               class={loaded ? 'w-full max-h-[80vh]' : 'w-full'}>
        <Head>
            <Row>
                <Cell columnId="gotchiId">
                    ID
                </Cell>
                <Cell columnId="name">
                    Name
                </Cell>
                <Cell columnId="experience">
                    Level
                </Cell>
                <Cell class="cursor-default">Owner</Cell>
                <Cell columnId="energy">
                    NRG ⚡
                </Cell>
                <Cell columnId="aggression">
                    AGG 👹
                </Cell>
                <Cell columnId="spookiness">
                    SPK 👻
                </Cell>
                <Cell columnId="brain">
                    BRN 🧠
                </Cell>
                <Cell columnId="eys">
                    EYS 👀
                </Cell>
                <Cell columnId="eyc">
                    EYC 👁
                </Cell>
                <Cell columnId="kinship">
                    Kinship
                </Cell>
                <Cell columnId="baseRarityScore">
                    Base Rarity Score
                </Cell>
                <Cell columnId="modifiedRarityScore">
                    Modified Rarity Score
                </Cell>
            </Row>
        </Head>
        <Body>
        {#each slice as gotchi (gotchi.gotchiId)}
            <Row>
                <Cell>{gotchi.gotchiId}</Cell>
                <Cell style="min-width: 100px; max-width: 100px;">
                    <Wrapper>
                        <span>{gotchi.name}</span>
                        <Tooltip>{gotchi.name}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.level}</span>
                        <Tooltip>Experience: {gotchi.experience}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell on:click={() => getAavegotchisByOwner(gotchi.owner.id)}>
                    <Wrapper>
                        <span class="cursor-pointer">{getOwnerId(gotchi.owner?.id)}</span>
                        <Tooltip>Click</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.energy}</span>
                        <Tooltip>Modified Energy: {gotchi.modifiedNumericTraits[0]}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.aggression}</span>
                        <Tooltip>Modified Aggression: {gotchi.modifiedNumericTraits[1]}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.spookiness}</span>
                        <Tooltip>Modified Spookiness: {gotchi.modifiedNumericTraits[2]}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.brain}</span>
                        <Tooltip>Modified Brain: {gotchi.modifiedNumericTraits[3]}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.eys}</span>
                        <Tooltip>Modified Eye Shape: {gotchi.modifiedNumericTraits[4]}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>
                    <Wrapper>
                        <span>{gotchi.eyc}</span>
                        <Tooltip>Modified Eye Color: {gotchi.modifiedNumericTraits[5]}</Tooltip>
                    </Wrapper>
                </Cell>
                <Cell>{gotchi.kinship}</Cell>
                <Cell>{gotchi.baseRarityScore}</Cell>
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
</div>
