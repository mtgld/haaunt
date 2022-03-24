<script lang="ts">
  import DataTable, { Body, Cell, Head, Pagination, Row, SortValue } from '@smui/data-table';

  import { initClient, operationStore, query } from '@urql/svelte';
  import { wearablesQuery } from '../queries/wearables';
  import type { Wearable } from '../types/wearable';
  import IconButton from '@smui/icon-button';
  import LinearProgress from '@smui/linear-progress';
  import Select, { Option } from '@smui/select';
  import { Label } from '@smui/common';

  initClient({
    url: 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
  });
  const wearables = operationStore<unknown, unknown, {itemTypes: Wearable[]}>(wearablesQuery)
  query(wearables)

  let items: Wearable[] = [];
  let loaded = false;
  let rowsPerPage = 15;
  let currentPage = 0;
  let lastPage;
  let sort: keyof Wearable = 'id';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';

  $: if ($wearables.data && !$wearables.fetching) {
    console.log(wearables.data)
    items = wearables.data.itemTypes.map((wearable) => {
      const rarity = getRarity(wearable.maxQuantity)
      // const TRS = rarity.brs
      //   + Math.abs(wearable.traitModifiers[0])
      //   + Math.abs(wearable.traitModifiers[1])
      //   + Math.abs(wearable.traitModifiers[2])
      //   + Math.abs(wearable.traitModifiers[3])
      // const rating = (TRS / (Number(wearable.maxQuantity) * 10000)) * 0.5**4
      return {
        ...wearable,
        ...rarity,
        // rating,
        energy: wearable.traitModifiers[0],
        aggression: wearable.traitModifiers[1],
        spookiness: wearable.traitModifiers[2],
        brain: wearable.traitModifiers[3],
        slot: getSlot(wearable.slotPositions)
      }
    })
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

  const getRarity = (quantity: string) => {
    const qNumber = Number(quantity)
    switch (true) {
      case qNumber === 1000:
        return { rarity: 'Common', color: 'white', brs: 1 };
      case qNumber === 500:
        return { rarity: 'Uncommon', color: 'lightskyblue', brs: 2 };
      case qNumber >= 250 && qNumber <= 308:
        return { rarity: 'Rare', color: 'cornflowerblue', brs: 5 };
      case qNumber >= 100 && qNumber <= 150:
        return { rarity: 'Legendary', color: 'orange', brs: 10 };
      case qNumber >= 10 && qNumber <= 50:
        return { rarity: 'Mythical', color: 'mediumpurple', brs: 20 };
      case qNumber === 5:
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
</script>

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
                <Cell columnId="scarcity">
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
                        {0}
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
