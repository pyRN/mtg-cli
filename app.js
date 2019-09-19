const chalk = require('chalk')
const request = require('request')
const yargs = require('yargs')

// CLI commands
yargs.command({
    command: 'card',
    describe: 'Get information about given card name',
    builder: {
        name: {
            describe: "Card Name",
            demandOption: true,
            type: 'string'
        },
        set: {
            describe: "Card from specific expansion",
            demandOption: false,
            type: 'string'
        }
    },
    handler(argv){
        console.log("Card Name: " + argv.name)
        if(argv.set){
            var url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(argv.name)}&set=${encodeURIComponent(argv.set)}`
        }
        else{
            var url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(argv.name)}`
        }
        
        request({url:url, json:true}, (error, response) =>{
            if(error){
                console.log("Request Failed:  ")
                console.log(error)
            }
            else if(response.object == "error"){
                console.log("Card not found: " + response.details)
            }
            else{
                var cardInfo = response.body
                if(cardInfo.card_faces){
                    // This works for flip cards and split cards
                    var card = {
                        "frontSide": {
                            "cardName": cardInfo.card_faces[0].name,
                            "manaCost": cardInfo.card_faces[0].mana_cost,
                            "typeLine": cardInfo.card_faces[0].type_line,
                            "oracleText": cardInfo.card_faces[0].oracle_text,
                            "flavorText":cardInfo.card_faces[0].flavor_text,
                            "artist": cardInfo.card_faces[0].artist,
                            "power": cardInfo.card_faces[0].power,
                            "toughness": cardInfo.card_faces[0].toughness
                        },
                        "backSide": {
                            "cardName": cardInfo.card_faces[1].name,
                            "manaCost": cardInfo.card_faces[1].mana_cost,
                            "typeLine": cardInfo.card_faces[1].type_line,
                            "oracleText": cardInfo.card_faces[1].oracle_text,
                            "flavorText":cardInfo.card_faces[1].flavor_text,
                            "artist": cardInfo.card_faces[1].artist,
                            "power": cardInfo.card_faces[1].power,
                            "toughness": cardInfo.card_faces[1].toughness
                        }
                    }

                    // Flip cards have image info inside card_faces
                    if(cardInfo.card_faces[0].image_uris){
                        card.frontSide['croppedImage'] = cardInfo.card_faces[0].image_uris.art_crop
                        card.backSide['croppedImage'] = cardInfo.card_faces[1].image_uris.art_crop
                    }
                    // Split cards have image info in image_uris
                    else{
                        card.frontSide['croppedImage'] = cardInfo.image_uris.art_crop
                        card.backSide['croppedImage'] = undefined
                    }
                }
                else{
                    var card = {
                        "frontSide": {
                            "cardName": cardInfo.name,
                            "manaCost": cardInfo.mana_cost,
                            "croppedImage": cardInfo.image_uris.art_crop,
                            "typeLine": cardInfo.type_line,
                            "oracleText": cardInfo.oracle_text,
                            "flavorText":cardInfo.flavor_text,
                            "artist": cardInfo.artist,
                            "power": cardInfo.power,
                            "toughness": cardInfo.toughness
                        },
                        "backSide": undefined  
                    }                      
                }                

                console.log(card)
            }
        })
    }
})

yargs.parse()