<script lang="ts">
  import DataTable, { Body, Cell, Head, Pagination, Row, SortValue } from '@smui/data-table';
  import { goto } from '$app/navigation'

  import { initClient, operationStore, query } from '@urql/svelte';
  import { wearablesQuery } from '../queries/wearables';
  import type { Wearable } from '../types/wearable';
  import IconButton from '@smui/icon-button';
  import LinearProgress from '@smui/linear-progress';
  import Select, { Option } from '@smui/select';
  import { Label } from '@smui/common';
  import Paper from "@smui/paper";
  import Icon from "@smui/textfield/icon";
  import { Input } from "@smui/textfield";
  import Button, { Label as ButtonLabel } from '@smui/button';

  initClient({
    url: 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
  });
  const wearables = operationStore<unknown, unknown, {itemTypes: Wearable[]}>(wearablesQuery)
  query(wearables)

  let items: Wearable[] = [];
  let wearableItems: Wearable[] = []
  let loaded = false;
  let search = '';
  let rowsPerPage = 15;
  let debounceTimer;
  let currentPage = 0;
  let lastPage;
  let sort: keyof Wearable = 'id';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

  $: if ($wearables.data && !$wearables.fetching) {
    const TQ = wearables.data.itemTypes.reduce((prev, curr) => {
      const slotIndex = curr.slotPositions.findIndex((item) => item === true)
      const rarity = curr.rarityScoreModifier;
      return {
        ...prev,
        [rarity]: {
          ...prev[rarity],
          [slotIndex]: Number(curr.maxQuantity) + (prev[rarity] ? prev[rarity][slotIndex] || 0 : 0)
        }
      }
    },{})

    wearableItems = wearables.data.itemTypes.map((wearable) => {
      const slotIndex = wearable.slotPositions.findIndex((item) => item === true)
      const rarity = getRarity(wearable)
      const TRS = rarity.brs
        + Math.abs(wearable.traitModifiers[0])
        + Math.abs(wearable.traitModifiers[1])
        + Math.abs(wearable.traitModifiers[2])
        + Math.abs(wearable.traitModifiers[3])
      const D = wearable.traitModifiers.filter((item)  => item !== 0).length;
      const rating = (((TRS / TQ[wearable.rarityScoreModifier][slotIndex]) * 0.5**D) * 100).toFixed(2);
      const isHands = wearable.slotPositions[4] || wearable.slotPositions[5]
      return {
        ...wearable,
        ...rarity,
        rating: isHands ? rating * 2 : rating,
        energy: wearable.traitModifiers[0],
        aggression: wearable.traitModifiers[1],
        spookiness: wearable.traitModifiers[2],
        brain: wearable.traitModifiers[3],
        slot: getSlot(wearable.slotPositions)
      }
    })
    items = wearableItems;
    loaded = true;
  }

  $: start = currentPage * rowsPerPage;
  $: end = Math.min(start + rowsPerPage, items.length);
  $: slice = items.slice(start, end)
  $: lastPage = Math.max(Math.ceil(items.length / rowsPerPage) - 1, 0);

  $: if (currentPage > lastPage) {
    currentPage = lastPage;
  }

  const handleSort = () => {
    items = items.sort((a, b) => {
      const [aVal, bVal] = [a[sort], b[sort]][
        sortDirection === 'ascending' ? 'slice' : 'reverse'
        ]();
      switch (sort) {
        case 'name':
        case 'slot':
          return (aVal as string).localeCompare(bVal as string);
        default:
          return Number(aVal) - Number(bVal);
      }
    });
  };

  const getRarity = (wearable: Wearable) => {
    switch (wearable.rarityScoreModifier) {
      case 1:
        return { rarity: 'Common', color: 'white', brs: 1 };
      case 2:
        return { rarity: 'Uncommon', color: 'lightskyblue', brs: 2 };
      case 5:
        return { rarity: 'Rare', color: 'cornflowerblue', brs: 5 };
      case 10:
        return { rarity: 'Legendary', color: 'orange', brs: 10 };
      case 20:
        return { rarity: 'Mythical', color: 'mediumpurple', brs: 20 };
      case 50:
        return { rarity: 'Godlike', color: 'red', brs: 50 };
      default:
        return { rarity: 'Common', color: 'white', brs: 1 };
    }
  }

  const getSlot = (slots: boolean[]) => {
    switch (true) {
      case slots[0]:
        return 'Body'
      case slots[1]:
        return 'Face'
      case slots[2]:
        return 'Eyes'
      case slots[3]:
        return 'Head'
      case slots[4]:
        return 'Hand Left'
      case slots[5]:
        return 'Hand Right'
      case slots[6]:
        return 'Pet'
      case slots[7]:
        return 'BG'
    }
  }
  const handleSearch = (event: KeyboardEvent) => {
    clearTimeout(debounceTimer);
    const target = event.target as HTMLInputElement
    debounceTimer = setTimeout(() => {
      search = target.value.toLowerCase();
      const isNumber = target.value.match(/^\d+$/)
      items = wearableItems.filter((wearable) => (isNumber ? wearable.id : wearable.name.toLowerCase()).includes(search))
    }, 300);
  }
</script>

<div class="pb-4 w-full flex items-center">
    <Paper class="flex p-2 h-full" elevation={3}>
        <Icon class="material-icons p-0 pr-2">search</Icon>
        <Input bind:search on:keyup={handleSearch} placeholder="Search"/>
    </Paper>
    <Button class="ml-4" on:click={() => goto('/leaderboard')} variant="outlined">
        <ButtonLabel>Leaderboard</ButtonLabel>
    </Button>
</div>
<div class="overflow-hidden">
    <DataTable sortable
               bind:sort
               bind:sortDirection
               on:SMUIDataTable:sorted={handleSort}
               class={loaded ? 'w-full max-h-[80vh]' : 'w-full'}>
        <Head>
            <Row>
                <Cell columnId="id">
                    ID
                </Cell>
                <Cell columnId="name">
                    Name
                </Cell>
                <Cell columnId="maxQuantity">
                    Rarity
                </Cell>
                <Cell columnId="slot">Slot</Cell>
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
                <Cell columnId="rating">
                    Scarcity Rating
                </Cell>
            </Row>
        </Head>
        <Body>
            {#each slice as wearable (wearable.id)}
                <Row>
                    <Cell>{wearable.id}</Cell>
                    <Cell>{wearable.name}</Cell>
                    <Cell>
                        <span style="color: {wearable.color}">
                            {wearable.rarity}
                        </span>
                    </Cell>
                    <Cell>
                        {wearable.slot}
                    </Cell>
                    <Cell>
                        {wearable.traitModifiers[0]}
                    </Cell>
                    <Cell>
                        {wearable.traitModifiers[1]}
                    </Cell>
                    <Cell>
                        {wearable.traitModifiers[2]}
                    </Cell>
                    <Cell>
                        {wearable.traitModifiers[3]}
                    </Cell>
                    <Cell>
                        {wearable.rating}
                    </Cell>
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
