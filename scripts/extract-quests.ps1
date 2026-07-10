# Regenerates src/data/quests.json from the KCD1 game files.
#
# Joins the quest registry (Tables.pak) with English journal titles and
# descriptions (Localization\English_xml.pak) via the skald string tables:
#   quest.xml -> quest2skald_subchapter.xml -> skald_quest_string.xml
#   -> text_ui_quest.xml
#
# Usage: powershell -ExecutionPolicy Bypass -File scripts\extract-quests.ps1
#        [-KcdPath "C:\...\KingdomComeDeliverance"]

param(
    [string]$KcdPath = "C:\Program Files (x86)\Steam\steamapps\common\KingdomComeDeliverance"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Read-Entry($zipPath, $entryName) {
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entry = $zip.GetEntry($entryName)
        $reader = New-Object System.IO.StreamReader($entry.Open())
        try { $reader.ReadToEnd() } finally { $reader.Close() }
    } finally {
        $zip.Dispose()
    }
}

$tablesPak = Join-Path $KcdPath 'Data\Tables.pak'
$englishPak = Join-Path $KcdPath 'Localization\English_xml.pak'

[xml]$questXml = Read-Entry $tablesPak 'Libs/Tables/quest/quest.xml'
[xml]$subXml = Read-Entry $tablesPak 'Libs/Tables/quest/quest2skald_subchapter.xml'
[xml]$stringXml = Read-Entry $tablesPak 'Libs/Tables/skald/skald_quest_string.xml'
$locText = Read-Entry $englishPak 'text_ui_quest.xml'

# localization key -> English text (last cell of each row)
$loc = @{}
foreach ($m in [regex]::Matches($locText, '<Row><Cell>([^<]+)</Cell><Cell>[^<]*</Cell><Cell>([^<]*)</Cell></Row>')) {
    $loc[$m.Groups[1].Value] = [System.Net.WebUtility]::HtmlDecode($m.Groups[2].Value)
}

# subchapter -> name/description localization keys
$subName = @{}; $subDesc = @{}
foreach ($row in $stringXml.database.table.rows.row) {
    if ($row.skald_quest_string_type_id -eq '1') { $subName[$row.skald_subchapter_id] = $row.string_name }
    else { $subDesc[$row.skald_subchapter_id] = $row.string_name }
}

# quest -> subchapter with the lowest quest_level
$q2sub = @{}
foreach ($row in $subXml.database.table.rows.row) {
    $qid = $row.quest_id
    if (-not $q2sub.ContainsKey($qid) -or [int]$row.quest_level -lt [int]$q2sub[$qid].level) {
        $q2sub[$qid] = @{ sub = $row.skald_subchapter_id; level = $row.quest_level }
    }
}

$regionMap = @{
    'Main' = 'Main story'; 'Race' = 'Talmberg'; 'Side-Activity' = 'Activity'
    'Side-Rat' = 'Rattay'; 'Side-Aus' = 'Uzhitz'; 'Side-Mon' = 'Monastery'
    'Side-Sas' = 'Sasau'; 'Side-Tal' = 'Talmberg'; 'Side-Led' = 'Ledetchko'
    'Side-Neu' = 'Neuhof'; 'Side-Mrh' = 'Merhojed'; 'Side-Prib' = 'Pribyslavitz'
    'Side-Ska' = 'Skalitz'; 'Side-Kuch' = 'Rattay Baths'; 'Side-Sam' = 'Samopesh'
    'Side-Bud' = 'Rattay'; 'Side-Cros' = 'Crossroads'; 'Side-Jak' = 'Uzhitz'
}

function Get-DlcName($questName) {
    if ($questName -match '^(q_theresa|q_romanceWithTheresa|q_dog|q_dlc_revelation)') { return "A Woman's Lot" }
    if ($questName -match '^q_rides') { return 'Band of Bastards' }
    if ($questName -match '^(q_dlc_newhomes|q_dlc_homes|dlc_homes)') { return 'From the Ashes' }
    if ($questName -match '^(q_gamblersDen|q_loveLetter|q_superstition)') { return 'Amorous Adventures' }
    if ($questName -match '^q_tournament') { return 'Tournament' }
    if ($questName -match 'treasuresOfThePast') { return 'Treasures of the Past' }
    return 'DLC'
}

$includeGroups = @('Main', 'DLC', 'Race', 'Side-Activity') + ($regionMap.Keys | Where-Object { $_ -like 'Side-*' })

# Cut content: fully designed in the tables (objectives, dialog topics and
# journal text all exist) but never wired into the world, so no data-level
# flag distinguishes them - the difference only exists in level placement
# and recorded audio. Matched by journal title against the community list:
# https://kingdom-come-deliverance.fandom.com/wiki/Unimplemented_quests
$cutQuests = @(
    'q_sikBas'          # Sick Bastard
    'q_whoseCow'        # Whose Cow
    'q_bodyOfChrist'    # Corpus Christi
    'q_inVinoVeritas'   # In Vino Veritas
    'q_avalonSteel'     # Foreign Steel
    'q_hangover'        # Divine Retribution
    'q_usurersGirl'     # Usurer's Daughter
    'q_troubleCorpse'   # No Rest for the Wicked
    'q_superstition'    # No Rest for the Wicked (duplicate title, also cut)
    'q_e3_2017_combat'  # Fight! (E3 2017 demo)
)

$quests = foreach ($row in $questXml.database.table.rows.row) {
    if ($includeGroups -notcontains $row.group) { continue }
    if ($cutQuests -contains $row.quest_name) { continue }
    if (-not $q2sub.ContainsKey($row.quest_id)) { continue }
    $sub = $q2sub[$row.quest_id].sub
    if (-not ($subName.ContainsKey($sub) -and $loc.ContainsKey($subName[$sub]))) { continue }
    $title = $loc[$subName[$sub]]
    if (-not $title) { continue }
    $desc = ''
    if ($subDesc.ContainsKey($sub) -and $loc.ContainsKey($subDesc[$sub])) { $desc = $loc[$subDesc[$sub]] }

    # type_id 1 marks main-quest mechanics, but a few regional side quests
    # carry it too (q_bodyOfChrist, q_killCow) - trust the group for those.
    $type = 'side'
    if ($row.quest_type_id -eq '1' -and $row.group -in @('Main', 'DLC')) { $type = 'main' }
    elseif ($row.quest_type_id -eq '3' -or $row.group -eq 'Side-Activity') { $type = 'activity' }

    $region = if ($row.group -eq 'DLC') { Get-DlcName $row.quest_name }
        elseif ($regionMap.ContainsKey($row.group)) { $regionMap[$row.group] }
        else { $row.group }

    [PSCustomObject]@{
        name = $row.quest_name
        title = $title
        desc = $desc
        type = $type
        region = $region
    }
}

$quests = $quests | Sort-Object type, region, title
$outPath = Join-Path $PSScriptRoot '..\src\data\quests.json'
$json = ConvertTo-Json @($quests) -Depth 3
[System.IO.File]::WriteAllText((Resolve-Path (Split-Path $outPath)).Path + '\quests.json', $json, (New-Object System.Text.UTF8Encoding($false)))
"quests.json written: $(@($quests).Count) quests (main: $(@($quests | Where-Object type -eq 'main').Count), side: $(@($quests | Where-Object type -eq 'side').Count), activity: $(@($quests | Where-Object type -eq 'activity').Count))"
