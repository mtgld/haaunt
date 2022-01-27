<script lang="ts">
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
</script>

<DataTable class="w-full">
    <Head>
        <Row>
            <Cell>Rank</Cell>
            <Cell>Token ID</Cell>
            <Cell>Name</Cell>
            <Cell>Level</Cell>
            <Cell>Owner</Cell>
            <Cell>NRG ⚡</Cell>
            <Cell>AGG 👹</Cell>
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
    <Row>
        <Cell>Steve</Cell>
        <Cell>Red</Cell>
        <Cell numeric>45</Cell>
    </Row>
    <Row>
        <Cell>Sharon</Cell>
        <Cell>Purple</Cell>
        <Cell numeric>5</Cell>
    </Row>
    <Row>
        <Cell>Rodney</Cell>
        <Cell>Orange</Cell>
        <Cell numeric>32</Cell>
    </Row>
    <Row>
        <Cell>Mack</Cell>
        <Cell>Blue</Cell>
        <Cell numeric>12</Cell>
    </Row>
    </Body>
</DataTable>