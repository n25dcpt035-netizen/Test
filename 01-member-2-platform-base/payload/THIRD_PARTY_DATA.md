# Third-party vocabulary data

The full lookup dictionary in `data/dictionary.bin` and selected fields in the curated
`data/words.csv` seed come from
[thichhoc-org/thichhoc-dict](https://github.com/thichhoc-org/thichhoc-dict).

- Source dataset: thichhoc-dict English–Vietnamese dictionary
- License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- Changes: repacked all 155,139 source records into a compact binary index for local lookup; selected 180
  learning-oriented words for the study collection; grouped the study words into six topics;
  retained the project's original 30 entries; shortened some multi-sense seed definitions; and
  added simple study examples.
- The Vietnamese meanings in the source dataset are machine-generated and should be reviewed
  before high-stakes language instruction.

`data/dictionary.bin` is a transformed copy of the complete source dataset and is distributed
under the same CC BY-SA 4.0 terms.
