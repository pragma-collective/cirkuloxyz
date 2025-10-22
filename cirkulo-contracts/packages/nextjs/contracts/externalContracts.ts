import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
  37111: {
    InviteOnlyRuleGroup: {
      "address": "0x82be599b51f4387D79315051dAD7a0f48AD5f513",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_backend",
              "type": "address"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "inputs": [],
          "name": "InvalidAddress",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "InvalidInviteCode",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "InviteAlreadyUsed",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "InviteExpired",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "InviteNotFound",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "OnlyBackend",
          "type": "error"
        },
        {
          "inputs": [],
          "name": "OnlyOwner",
          "type": "error"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "oldBackend",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newBackend",
              "type": "address"
            }
          ],
          "name": "BackendUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "inviter",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "inviteCodeHash",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            }
          ],
          "name": "InviteRegistered",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "invitee",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "inviteCodeHash",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "inviter",
              "type": "address"
            }
          ],
          "name": "InviteUsed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            }
          ],
          "name": "RuleConfigured",
          "type": "event"
        },
        {
          "inputs": [],
          "name": "backend",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "name": "configure",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "inviteCodeHash",
              "type": "bytes32"
            }
          ],
          "name": "getInvite",
          "outputs": [
            {
              "internalType": "address",
              "name": "inviter",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "used",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "usedBy",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "name": "invites",
          "outputs": [
            {
              "internalType": "address",
              "name": "inviter",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "used",
              "type": "bool"
            },
            {
              "internalType": "address",
              "name": "usedBy",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "name": "processAddition",
          "outputs": [],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "account",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "ruleParams",
              "type": "tuple[]"
            }
          ],
          "name": "processJoining",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "name": "processLeaving",
          "outputs": [],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            },
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "key",
                  "type": "bytes32"
                },
                {
                  "internalType": "bytes",
                  "name": "value",
                  "type": "bytes"
                }
              ],
              "internalType": "struct KeyValue[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "name": "processRemoval",
          "outputs": [],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "configSalt",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "inviter",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "inviteCodeHash",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "expiresAt",
              "type": "uint256"
            }
          ],
          "name": "registerInvite",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newBackend",
              "type": "address"
            }
          ],
          "name": "updateBackend",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ],
      "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
      "receipt": {
        "to": null,
        "from": "0xCc4F1cae67c5c1216B298152Ea4323fd2475E496",
        "contractAddress": "0x82be599b51f4387D79315051dAD7a0f48AD5f513",
        "transactionIndex": 0,
        "gasUsed": "449978",
        "logsBloom": "0x00000000000400080000010000000000000000000000400000000000000000002000000000100000000000040202000000000010000000000001000000000000000100800001040000000028000040000401000000000000002000000000080000000040020100000000000000000800000000000000400000000010000000400000001000001000400004002100000000000100000000000000000000000080000000000100100000000000800100000000000000000000002000010000000000000002008020000000000000000000010010000100000000000000000020000000000000002000000000000000000000000004000000000000000080000000",
        "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b",
        "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
        "logs": [
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x000000000000000000000000000000000000800A",
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x000000000000000000000000cc4f1cae67c5c1216b298152ea4323fd2475e496",
              "0x0000000000000000000000000000000000000000000000000000000000008001"
            ],
            "data": "0x000000000000000000000000000000000000000000000000004f328041e1d124",
            "logIndex": 0,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x000000000000000000000000000000000000800A",
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000008001",
              "0x000000000000000000000000cc4f1cae67c5c1216b298152ea4323fd2475e496"
            ],
            "data": "0x00000000000000000000000000000000000000000000000000109f246620c99c",
            "logIndex": 1,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x82be599b51f4387D79315051dAD7a0f48AD5f513",
            "topics": [
              "0x37f6c561371bb449a598aaf7e5528fc87ad233e82669756cd67fec9c5f665a7b",
              "0x0000000000000000000000000000000000000000000000000000000000000000",
              "0x000000000000000000000000cc4f1cae67c5c1216b298152ea4323fd2475e496"
            ],
            "data": "0x",
            "logIndex": 2,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x0000000000000000000000000000000000008008",
            "topics": [
              "0x27fe8c0b49f49507b9d4fe5968c9f49edfe5c9df277d433a07a0717ede97638d"
            ],
            "data": "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000011700000000000000000000000000000000000000000000000000000000000080080000000000000000000000000000000000000000000000000000000000008004dfaf0e16bc008d1a8d1bcfb1675e5bc29a34a5d6f4b4e1216ed58c274711e593",
            "logIndex": 3,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x0000000000000000000000000000000000008008",
            "topics": [
              "0x3a36e47291f4201faf137fab081d92295bce2d53be2c6ca68ba82c7faa9ce241",
              "0x0000000000000000000000000000000000000000000000000000000000008004",
              "0xdfaf0e16bc008d1a8d1bcfb1675e5bc29a34a5d6f4b4e1216ed58c274711e593"
            ],
            "data": "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000b60608060405234801561001057600080fd5b50600436106100b45760003560e01c80636ad37721116100715780636ad37721146101ab5780636e1e352a146101be5780638da5cb5b1461020e578063c0ed969a14610221578063c585084c14610234578063f2fde38b1461024757600080fd5b806307bcf26a146100b9578063099e4133146100d1578063363c68ac1461010157806353b557511461010157806363858aa2146101185780636669818914610198575b600080fd5b6100cf6100c7366004610780565b505050505050565b005b6000546100e4906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100cf61010f36600461080a565b50505050505050565b6101656101263660046108a5565b600260208181526000938452604080852090915291835291208054600182015491909201546001600160a01b039283169260ff82169161010090041684565b604080516001600160a01b03958616815260208101949094529115159183019190915290911660608201526080016100f8565b6100cf6101a63660046108c7565b61025a565b6100cf6101b9366004610780565b61037c565b6101656101cc3660046108a5565b600091825260026020818152604080852093855292905291208054600182015491909201546001600160a01b0392831693919260ff8216926101009092041690565b6001546100e4906001600160a01b031681565b6100cf61022f366004610902565b610509565b6100cf610242366004610924565b6105ab565b6100cf610255366004610902565b6105db565b6000546001600160a01b0316331461028557604051636bbaa1c160e01b815260040160405180910390fd5b6001600160a01b0383166102ac5760405163e6c4247b60e01b815260040160405180910390fd5b816102ca57604051633b19367b60e01b815260040160405180910390fd5b60008481526002602081815260408084208685529091529091209081015460ff161561030957604051634209eb7d60e01b815260040160405180910390fd5b80546001600160a01b0319166001600160a01b0385169081178255600182018390556002820180546001600160a81b031916905560405183815284919087907f6e074b649c1f27bd566a71f5f15443ca61b17b2a02554ca9edca137a8aa2aafa9060200160405180910390a45050505050565b6001600160a01b0385166103a35760405163e6c4247b60e01b815260040160405180910390fd5b60006103af838361064f565b905080516000036103d357604051633b19367b60e01b815260040160405180910390fd5b6000816040516020016103e69190610970565b60408051601f19818403018152918152815160209283012060008b81526002845282812082825290935291208054919250906001600160a01b031661043e57604051633b19367b60e01b815260040160405180910390fd5b600281015460ff161561046457604051634209eb7d60e01b815260040160405180910390fd5b60018101541580159061047a5750806001015442115b1561049857604051633c8a622d60e21b815260040160405180910390fd5b6002810180546001600160a01b038a811661010081026001600160a81b03199093169290921760011790925582546040519216825283918b907f7b4e33ed87bbe576349a5310b0a0588c3fe0437cef71142d686bbec9d8abc3bd9060200160405180910390a4505050505050505050565b6001546001600160a01b0316331461053457604051635fc483c560e01b815260040160405180910390fd5b6001600160a01b03811661055b5760405163e6c4247b60e01b815260040160405180910390fd5b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f37f6c561371bb449a598aaf7e5528fc87ad233e82669756cd67fec9c5f665a7b9190a35050565b60405183907f584dfcec25d035967c3849e8ff0ad02f80bdc315b282d68c5604e27a740d06b190600090a2505050565b6001546001600160a01b0316331461060657604051635fc483c560e01b815260040160405180910390fd5b6001600160a01b03811661062d5760405163e6c4247b60e01b815260040160405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b606060005b82811015610700577f5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e84848381811061068f5761068f61099f565b90506020028101906106a191906109b5565b35036106ee578383828181106106b9576106b961099f565b90506020028101906106cb91906109b5565b6106d99060208101906109d5565b8101906106e69190610a32565b915050610712565b806106f881610ae3565b915050610654565b50506040805160208101909152600081525b92915050565b80356001600160a01b038116811461072f57600080fd5b919050565b60008083601f84011261074657600080fd5b50813567ffffffffffffffff81111561075e57600080fd5b6020830191508360208260051b850101111561077957600080fd5b9250929050565b6000806000806000806080878903121561079957600080fd5b863595506107a960208801610718565b9450604087013567ffffffffffffffff808211156107c657600080fd5b6107d28a838b01610734565b909650945060608901359150808211156107eb57600080fd5b506107f889828a01610734565b979a9699509497509295939492505050565b600080600080600080600060a0888a03121561082557600080fd5b8735965061083560208901610718565b955061084360408901610718565b9450606088013567ffffffffffffffff8082111561086057600080fd5b61086c8b838c01610734565b909650945060808a013591508082111561088557600080fd5b506108928a828b01610734565b989b979a50959850939692959293505050565b600080604083850312156108b857600080fd5b50508035926020909101359150565b600080600080608085870312156108dd57600080fd5b843593506108ed60208601610718565b93969395505050506040820135916060013590565b60006020828403121561091457600080fd5b61091d82610718565b9392505050565b60008060006040848603121561093957600080fd5b83359250602084013567ffffffffffffffff81111561095757600080fd5b61096386828701610734565b9497909650939450505050565b6000825160005b818110156109915760208186018101518583015201610977565b506000920191825250919050565b634e487b7160e01b600052603260045260246000fd5b60008235603e198336030181126109cb57600080fd5b9190910192915050565b6000808335601e198436030181126109ec57600080fd5b83018035915067ffffffffffffffff821115610a0757600080fd5b60200191503681900382131561077957600080fd5b634e487b7160e01b600052604160045260246000fd5b600060208284031215610a4457600080fd5b813567ffffffffffffffff80821115610a5c57600080fd5b818401915084601f830112610a7057600080fd5b813581811115610a8257610a82610a1c565b604051601f8201601f19908116603f01168101908382118183101715610aaa57610aaa610a1c565b81604052828152876020848701011115610ac357600080fd5b826020860160208301376000928101602001929092525095945050505050565b600060018201610b0357634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220e67c9df4345ec78cc04ae1e79a6894eb382ca495bebc774ff9140a7de040361c64736f6c634300081400330000000000000000000000000000000000000000000000000000000000000000",
            "logIndex": 4,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x0000000000000000000000000000000000008004",
            "topics": [
              "0xc94722ff13eacf53547c4741dab5228353a05938ffcdd5d4a2d533ae0e618287",
              "0x02000b406fec7839515e83644223ab37a88d3a512e7e896d749c3c8eb199e476",
              "0x0000000000000000000000000000000000000000000000000000000000000000"
            ],
            "data": "0x",
            "logIndex": 5,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x0000000000000000000000000000000000008006",
            "topics": [
              "0x290afdae231a3fc0bbae8b1af63698b0a1d79b21ad17df0342dfb952fe74f8e5",
              "0x000000000000000000000000cc4f1cae67c5c1216b298152ea4323fd2475e496",
              "0x02000b406fec7839515e83644223ab37a88d3a512e7e896d749c3c8eb199e476",
              "0x00000000000000000000000082be599b51f4387d79315051dad7a0f48ad5f513"
            ],
            "data": "0x",
            "logIndex": 6,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          },
          {
            "transactionIndex": 0,
            "blockNumber": 4171935,
            "transactionHash": "0xb825437d7614eb3c0d2e198b93e979d0b3f8b5990a9156375796ee2429a23e14",
            "address": "0x000000000000000000000000000000000000800A",
            "topics": [
              "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
              "0x0000000000000000000000000000000000000000000000000000000000008001",
              "0x000000000000000000000000cc4f1cae67c5c1216b298152ea4323fd2475e496"
            ],
            "data": "0x00000000000000000000000000000000000000000000000000388f23c99ee7d8",
            "logIndex": 7,
            "blockHash": "0x63d698e42468d0c8058f1ed508e3de2bb25a28c23e5896172cfd1440cc43760b"
          }
        ],
        "blockNumber": 4171935,
        "cumulativeGasUsed": "0",
        "status": 1,
        "byzantium": true
      },
      "args": [
        "0xCc4F1cae67c5c1216B298152Ea4323fd2475E496"
      ],
      "numDeployments": 1,
      "solcInputHash": "a50467425fbaa5bcab5a7cd637bd47f7",
      "metadata": "{\"compiler\":{\"version\":\"0.8.20+commit.a1b79de6\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_backend\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"InvalidAddress\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InvalidInviteCode\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InviteAlreadyUsed\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InviteExpired\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"InviteNotFound\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"OnlyBackend\",\"type\":\"error\"},{\"inputs\":[],\"name\":\"OnlyOwner\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"oldBackend\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newBackend\",\"type\":\"address\"}],\"name\":\"BackendUpdated\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"inviter\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"inviteCodeHash\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"expiresAt\",\"type\":\"uint256\"}],\"name\":\"InviteRegistered\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"invitee\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"inviteCodeHash\",\"type\":\"bytes32\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"inviter\",\"type\":\"address\"}],\"name\":\"InviteUsed\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"}],\"name\":\"RuleConfigured\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"backend\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"}],\"name\":\"configure\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"inviteCodeHash\",\"type\":\"bytes32\"}],\"name\":\"getInvite\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"inviter\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"expiresAt\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"used\",\"type\":\"bool\"},{\"internalType\":\"address\",\"name\":\"usedBy\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"invites\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"inviter\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"expiresAt\",\"type\":\"uint256\"},{\"internalType\":\"bool\",\"name\":\"used\",\"type\":\"bool\"},{\"internalType\":\"address\",\"name\":\"usedBy\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"}],\"name\":\"processAddition\",\"outputs\":[],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"account\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"ruleParams\",\"type\":\"tuple[]\"}],\"name\":\"processJoining\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"}],\"name\":\"processLeaving\",\"outputs\":[],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"},{\"components\":[{\"internalType\":\"bytes32\",\"name\":\"key\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"value\",\"type\":\"bytes\"}],\"internalType\":\"struct KeyValue[]\",\"name\":\"\",\"type\":\"tuple[]\"}],\"name\":\"processRemoval\",\"outputs\":[],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"configSalt\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"inviter\",\"type\":\"address\"},{\"internalType\":\"bytes32\",\"name\":\"inviteCodeHash\",\"type\":\"bytes32\"},{\"internalType\":\"uint256\",\"name\":\"expiresAt\",\"type\":\"uint256\"}],\"name\":\"registerInvite\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newBackend\",\"type\":\"address\"}],\"name\":\"updateBackend\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}],\"devdoc\":{\"details\":\"Implements IGroupRule interface for on-chain validation  This contract allows groups to be invite-only by: 1. Backend registers invite codes on-chain (hashed for privacy) 2. Users provide invite code when joining 3. Contract validates code and marks as used (one-time use) 4. Admins can still add members directly (override)\",\"kind\":\"dev\",\"methods\":{\"configure(bytes32,(bytes32,bytes)[])\":{\"details\":\"Called by Lens Protocol when rule is added to group\",\"params\":{\"configSalt\":\"Unique configuration identifier  NOTE: This is part of the IGroupRule interface. For now, we don't need any special configuration. ConfigSalt serves as unique identifier per group.\"}},\"constructor\":{\"params\":{\"_backend\":\"Address authorized to register invites\"}},\"getInvite(bytes32,bytes32)\":{\"params\":{\"configSalt\":\"Group configuration identifier\",\"inviteCodeHash\":\"Hash of the invite code\"},\"returns\":{\"expiresAt\":\"Expiration timestamp\",\"inviter\":\"Address that created the invite\",\"used\":\"Whether the invite was used\",\"usedBy\":\"Address that used the invite (if used)\"}},\"processAddition(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"details\":\"Empty implementation = ALLOW all admin additions  WHY: Admins should be able to add members without invites. This gives admins an \\\"override\\\" capability for: - Emergency adds - Onboarding founding members - Recovering from issues  HOW IT WORKS: - Function completes without reverting - Lens Protocol interprets this as \\\"validation passed\\\" - Admin can add member successfully\"},\"processJoining(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"details\":\"Validates invite code and marks it as used\",\"params\":{\"account\":\"The account attempting to join\",\"configSalt\":\"The configuration salt for the group\",\"ruleParams\":\"Rule-specific parameters containing the invite code\"}},\"processLeaving(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"details\":\"Empty implementation = ALLOW anyone to leave anytime  WHY: Users should always have the right to leave a group. This prevents groups from becoming \\\"traps\\\" that lock users in. It's a fundamental user freedom.\"},\"processRemoval(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"details\":\"Empty implementation = ALLOW all removals  WHY: Admins should always be able to remove members. This is a safety mechanism - groups should never be locked with bad actors that can't be removed.\"},\"registerInvite(bytes32,address,bytes32,uint256)\":{\"details\":\"Only callable by the designated backend address\",\"params\":{\"configSalt\":\"The configuration salt for the group\",\"expiresAt\":\"The expiration timestamp (0 for no expiration)\",\"inviteCodeHash\":\"The hash of the invite code\",\"inviter\":\"The address creating the invite\"}},\"transferOwnership(address)\":{\"details\":\"Only callable by current owner\",\"params\":{\"newOwner\":\"New owner address\"}},\"updateBackend(address)\":{\"details\":\"Only callable by contract owner\",\"params\":{\"newBackend\":\"New backend address\"}}},\"stateVariables\":{\"PARAM__INVITE_CODE\":{\"custom:keccak\":\"lens.param.inviteCode\"},\"invites\":{\"details\":\"configSalt is unique per group, inviteCodeHash is unique per invite\"}},\"title\":\"InviteOnlyGroupRule\",\"version\":1},\"userdoc\":{\"kind\":\"user\",\"methods\":{\"backend()\":{\"notice\":\"Backend address authorized to register invites\"},\"configure(bytes32,(bytes32,bytes)[])\":{\"notice\":\"Configure rule for a specific group\"},\"constructor\":{\"notice\":\"Initialize contract with backend signer address\"},\"getInvite(bytes32,bytes32)\":{\"notice\":\"Get invite details by invite code hash\"},\"invites(bytes32,bytes32)\":{\"notice\":\"Mapping of configSalt -> inviteCodeHash -> invite data\"},\"owner()\":{\"notice\":\"Contract owner (can update backend address)\"},\"processAddition(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"notice\":\"Validate when admin tries to add a member\"},\"processJoining(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"notice\":\"Process a join request (IGroupRule interface)\"},\"processLeaving(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"notice\":\"Validate when someone tries to leave the group\"},\"processRemoval(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])\":{\"notice\":\"Validate when admin tries to remove a member\"},\"registerInvite(bytes32,address,bytes32,uint256)\":{\"notice\":\"Register a new invite for a group\"},\"transferOwnership(address)\":{\"notice\":\"Transfer ownership to new address\"},\"updateBackend(address)\":{\"notice\":\"Update backend signer address\"}},\"notice\":\"Lens Protocol Group Rule that validates invite codes\",\"version\":1}},\"settings\":{\"compilationTarget\":{\"contracts/InviteOnlyGroupRule.sol\":\"InviteOnlyGroupRule\"},\"evmVersion\":\"paris\",\"libraries\":{},\"metadata\":{\"bytecodeHash\":\"ipfs\",\"useLiteralContent\":true},\"optimizer\":{\"enabled\":true,\"runs\":200},\"remappings\":[]},\"sources\":{\"contracts/InviteOnlyGroupRule.sol\":{\"content\":\"// SPDX-License-Identifier: MIT\\npragma solidity ^0.8.20;\\n\\n/**\\n * @title IGroupRule Interface\\n * @notice Interface that all Lens Protocol group rules must implement\\n * @dev Based on Lens Protocol documentation for custom group rules\\n */\\ninterface IGroupRule {\\n    /**\\n     * @notice Configure the rule for a specific group\\n     * @param configSalt Unique configuration identifier (32 bytes)\\n     * @param ruleParams Configuration parameters as key-value pairs\\n     */\\n    function configure(\\n        bytes32 configSalt, \\n        KeyValue[] calldata ruleParams\\n    ) external;\\n\\n    /**\\n     * @notice Called when admin adds a member\\n     * @param configSalt Configuration identifier\\n     * @param originalMsgSender Original transaction sender\\n     * @param account Account being added\\n     * @param primitiveParams Parameters from the group\\n     * @param ruleParams Rule-specific parameters\\n     */\\n    function processAddition(\\n        bytes32 configSalt,\\n        address originalMsgSender,\\n        address account,\\n        KeyValue[] calldata primitiveParams,\\n        KeyValue[] calldata ruleParams\\n    ) external;\\n\\n    /**\\n     * @notice Called when admin removes a member\\n     */\\n    function processRemoval(\\n        bytes32 configSalt,\\n        address originalMsgSender,\\n        address account,\\n        KeyValue[] calldata primitiveParams,\\n        KeyValue[] calldata ruleParams\\n    ) external;\\n\\n    /**\\n     * @notice Called when someone tries to join\\n     */\\n    function processJoining(\\n        bytes32 configSalt,\\n        address account,\\n        KeyValue[] calldata primitiveParams,\\n        KeyValue[] calldata ruleParams\\n    ) external;\\n\\n    /**\\n     * @notice Called when someone tries to leave\\n     */\\n    function processLeaving(\\n        bytes32 configSalt,\\n        address account,\\n        KeyValue[] calldata primitiveParams,\\n        KeyValue[] calldata ruleParams\\n    ) external;\\n}\\n\\n/// @notice Key-value pair structure used by Lens Protocol\\nstruct KeyValue {\\n    bytes32 key;\\n    bytes value;\\n}\\n\\n/**\\n * @title InviteOnlyGroupRule\\n * @notice Lens Protocol Group Rule that validates invite codes\\n * @dev Implements IGroupRule interface for on-chain validation\\n * \\n * This contract allows groups to be invite-only by:\\n * 1. Backend registers invite codes on-chain (hashed for privacy)\\n * 2. Users provide invite code when joining\\n * 3. Contract validates code and marks as used (one-time use)\\n * 4. Admins can still add members directly (override)\\n */\\ncontract InviteOnlyGroupRule is IGroupRule {\\n    // ========== ERRORS ==========\\n    error OnlyBackend();\\n    error OnlyOwner();\\n    error InviteNotFound();\\n    error InviteExpired();\\n    error InviteAlreadyUsed();\\n    error InvalidAddress();\\n    error InvalidInviteCode();\\n    \\n    // ========== EVENTS ==========\\n    event InviteRegistered(\\n        bytes32 indexed configSalt,\\n        address indexed inviter,\\n        bytes32 indexed inviteCodeHash,\\n        uint256 expiresAt\\n    );\\n    \\n    event InviteUsed(\\n        bytes32 indexed configSalt,\\n        address indexed invitee,\\n        bytes32 indexed inviteCodeHash,\\n        address inviter\\n    );\\n    \\n    event BackendUpdated(\\n        address indexed oldBackend,\\n        address indexed newBackend\\n    );\\n    \\n    event RuleConfigured(bytes32 indexed configSalt);\\n    \\n    // ========== STORAGE ==========\\n    \\n    /// @notice Backend address authorized to register invites\\n    address public backend;\\n    \\n    /// @notice Contract owner (can update backend address)\\n    address public owner;\\n    \\n    /// @notice Mapping of configSalt -> inviteCodeHash -> invite data\\n    /// @dev configSalt is unique per group, inviteCodeHash is unique per invite\\n    mapping(bytes32 => mapping(bytes32 => InviteData)) public invites;\\n    \\n    /// @notice Invite data structure\\n    struct InviteData {\\n        address inviter;       // Address of person who created the invite\\n        uint256 expiresAt;     // Expiration timestamp\\n        bool used;             // Whether invite was used\\n        address usedBy;        // Address that used this invite (set when used)\\n    }\\n    \\n    // ========== MODIFIERS ==========\\n    \\n    modifier onlyBackend() {\\n        if (msg.sender != backend) revert OnlyBackend();\\n        _;\\n    }\\n    \\n    modifier onlyOwner() {\\n        if (msg.sender != owner) revert OnlyOwner();\\n        _;\\n    }\\n    \\n    // ========== CONSTRUCTOR ==========\\n    \\n    /**\\n     * @notice Initialize contract with backend signer address\\n     * @param _backend Address authorized to register invites\\n     */\\n    constructor(address _backend) {\\n        if (_backend == address(0)) revert InvalidAddress();\\n        backend = _backend;\\n        owner = msg.sender;\\n        \\n        emit BackendUpdated(address(0), _backend);\\n    }\\n    \\n    // ========== BACKEND FUNCTIONS ==========\\n    \\n    /**\\n     * @notice Register a new invite for a group\\n     * @dev Only callable by the designated backend address\\n     * @param configSalt The configuration salt for the group\\n     * @param inviter The address creating the invite\\n     * @param inviteCodeHash The hash of the invite code\\n     * @param expiresAt The expiration timestamp (0 for no expiration)\\n     */\\n    function registerInvite(\\n        bytes32 configSalt,\\n        address inviter,\\n        bytes32 inviteCodeHash,\\n        uint256 expiresAt\\n    ) external onlyBackend {\\n        if (inviter == address(0)) revert InvalidAddress();\\n        if (inviteCodeHash == bytes32(0)) revert InvalidInviteCode();\\n        \\n        InviteData storage invite = invites[configSalt][inviteCodeHash];\\n        \\n        // Allow re-registration if not yet used\\n        if (invite.used) revert InviteAlreadyUsed();\\n        \\n        invite.inviter = inviter;\\n        invite.expiresAt = expiresAt;\\n        invite.used = false;\\n        invite.usedBy = address(0);\\n        \\n        emit InviteRegistered(configSalt, inviter, inviteCodeHash, expiresAt);\\n    }\\n    \\n    /**\\n     * @notice Update backend signer address\\n     * @dev Only callable by contract owner\\n     * @param newBackend New backend address\\n     */\\n    function updateBackend(address newBackend) external onlyOwner {\\n        if (newBackend == address(0)) revert InvalidAddress();\\n        \\n        address oldBackend = backend;\\n        backend = newBackend;\\n        \\n        emit BackendUpdated(oldBackend, newBackend);\\n    }\\n    \\n    /**\\n     * @notice Transfer ownership to new address\\n     * @dev Only callable by current owner\\n     * @param newOwner New owner address\\n     */\\n    function transferOwnership(address newOwner) external onlyOwner {\\n        if (newOwner == address(0)) revert InvalidAddress();\\n        owner = newOwner;\\n    }\\n    \\n    // ========== LENS PROTOCOL IGROUPRULE INTERFACE ==========\\n    \\n    /**\\n     * @notice Configure rule for a specific group\\n     * @dev Called by Lens Protocol when rule is added to group\\n     * @param configSalt Unique configuration identifier\\n     * \\n     * NOTE: This is part of the IGroupRule interface.\\n     * For now, we don't need any special configuration.\\n     * ConfigSalt serves as unique identifier per group.\\n     */\\n    function configure(\\n        bytes32 configSalt,\\n        KeyValue[] calldata /* ruleParams */\\n    ) external override {\\n        emit RuleConfigured(configSalt);\\n    }\\n    \\n    // Parameter keys (using Lens Protocol pattern)\\n    /// @custom:keccak lens.param.inviteCode\\n    bytes32 constant PARAM__INVITE_CODE = 0x5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e;\\n    \\n    /**\\n     * @notice Process a join request (IGroupRule interface)\\n     * @dev Validates invite code and marks it as used\\n     * @param configSalt The configuration salt for the group\\n     * @param account The account attempting to join\\n     * @param ruleParams Rule-specific parameters containing the invite code\\n     */\\n    function processJoining(\\n        bytes32 configSalt,\\n        address account,\\n        KeyValue[] calldata /* primitiveParams */,\\n        KeyValue[] calldata ruleParams\\n    ) external override {\\n        if (account == address(0)) revert InvalidAddress();\\n        \\n        // Extract invite code from params\\n        string memory providedCode = _extractInviteCode(ruleParams);\\n        if (bytes(providedCode).length == 0) revert InvalidInviteCode();\\n        \\n        // Hash the provided code\\n        bytes32 providedCodeHash = keccak256(abi.encodePacked(providedCode));\\n        \\n        // Get the invite data using the hash as the key\\n        InviteData storage invite = invites[configSalt][providedCodeHash];\\n        \\n        // Validate invite exists\\n        if (invite.inviter == address(0)) revert InvalidInviteCode();\\n        \\n        // Check if already used\\n        if (invite.used) revert InviteAlreadyUsed();\\n        \\n        // Check expiration\\n        if (invite.expiresAt != 0 && block.timestamp > invite.expiresAt) {\\n            revert InviteExpired();\\n        }\\n        \\n        // Mark as used and record who used it\\n        invite.used = true;\\n        invite.usedBy = account;\\n        \\n        emit InviteUsed(configSalt, account, providedCodeHash, invite.inviter);\\n    }\\n    \\n    /**\\n     * @notice Validate when admin tries to add a member\\n     * @dev Empty implementation = ALLOW all admin additions\\n     * \\n     * WHY: Admins should be able to add members without invites.\\n     * This gives admins an \\\"override\\\" capability for:\\n     * - Emergency adds\\n     * - Onboarding founding members\\n     * - Recovering from issues\\n     * \\n     * HOW IT WORKS:\\n     * - Function completes without reverting\\n     * - Lens Protocol interprets this as \\\"validation passed\\\"\\n     * - Admin can add member successfully\\n     */\\n    function processAddition(\\n        bytes32 /* configSalt */,\\n        address /* originalMsgSender */,\\n        address /* account */,\\n        KeyValue[] calldata /* primitiveParams */,\\n        KeyValue[] calldata /* ruleParams */\\n    ) external pure override {\\n        // Empty implementation = allow action\\n        // No revert = validation passed\\n    }\\n    \\n    /**\\n     * @notice Validate when admin tries to remove a member\\n     * @dev Empty implementation = ALLOW all removals\\n     * \\n     * WHY: Admins should always be able to remove members.\\n     * This is a safety mechanism - groups should never be locked\\n     * with bad actors that can't be removed.\\n     */\\n    function processRemoval(\\n        bytes32 /* configSalt */,\\n        address /* originalMsgSender */,\\n        address /* account */,\\n        KeyValue[] calldata /* primitiveParams */,\\n        KeyValue[] calldata /* ruleParams */\\n    ) external pure override {\\n        // Empty implementation = allow action\\n    }\\n    \\n    /**\\n     * @notice Validate when someone tries to leave the group\\n     * @dev Empty implementation = ALLOW anyone to leave anytime\\n     * \\n     * WHY: Users should always have the right to leave a group.\\n     * This prevents groups from becoming \\\"traps\\\" that lock users in.\\n     * It's a fundamental user freedom.\\n     */\\n    function processLeaving(\\n        bytes32 /* configSalt */,\\n        address /* account */,\\n        KeyValue[] calldata /* primitiveParams */,\\n        KeyValue[] calldata /* ruleParams */\\n    ) external pure override {\\n        // Empty implementation = allow action\\n    }\\n    \\n    // ========== VIEW FUNCTIONS ==========\\n    \\n    /**\\n     * @notice Extract invite code from KeyValue parameters\\n     * @dev Helper function to parse Lens Protocol params\\n     * @param params Array of KeyValue pairs\\n     * @return Invite code string\\n     */\\n    function _extractInviteCode(KeyValue[] calldata params) private pure returns (string memory) {\\n        for (uint256 i = 0; i < params.length; i++) {\\n            if (params[i].key == PARAM__INVITE_CODE) {\\n                return abi.decode(params[i].value, (string));\\n            }\\n        }\\n        return \\\"\\\";\\n    }\\n    \\n    /**\\n     * @notice Get invite details by invite code hash\\n     * @param configSalt Group configuration identifier\\n     * @param inviteCodeHash Hash of the invite code\\n     * @return inviter Address that created the invite\\n     * @return expiresAt Expiration timestamp\\n     * @return used Whether the invite was used\\n     * @return usedBy Address that used the invite (if used)\\n     */\\n    function getInvite(\\n        bytes32 configSalt,\\n        bytes32 inviteCodeHash\\n    ) external view returns (\\n        address inviter,\\n        uint256 expiresAt,\\n        bool used,\\n        address usedBy\\n    ) {\\n        InviteData storage invite = invites[configSalt][inviteCodeHash];\\n        return (invite.inviter, invite.expiresAt, invite.used, invite.usedBy);\\n    }\\n}\\n\",\"keccak256\":\"0x18b83d3ed80df473df0483a53b8e27f9da7971cbf5536ba500c21e78c908da59\",\"license\":\"MIT\"}},\"version\":1}",
      "bytecode": "0x608060405234801561001057600080fd5b50604051610c30380380610c3083398101604081905261002f916100b1565b6001600160a01b0381166100565760405163e6c4247b60e01b815260040160405180910390fd5b600080546001600160a01b0383166001600160a01b0319918216811783556001805490921633179091556040519091907f37f6c561371bb449a598aaf7e5528fc87ad233e82669756cd67fec9c5f665a7b908290a3506100e1565b6000602082840312156100c357600080fd5b81516001600160a01b03811681146100da57600080fd5b9392505050565b610b40806100f06000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80636ad37721116100715780636ad37721146101ab5780636e1e352a146101be5780638da5cb5b1461020e578063c0ed969a14610221578063c585084c14610234578063f2fde38b1461024757600080fd5b806307bcf26a146100b9578063099e4133146100d1578063363c68ac1461010157806353b557511461010157806363858aa2146101185780636669818914610198575b600080fd5b6100cf6100c7366004610780565b505050505050565b005b6000546100e4906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100cf61010f36600461080a565b50505050505050565b6101656101263660046108a5565b600260208181526000938452604080852090915291835291208054600182015491909201546001600160a01b039283169260ff82169161010090041684565b604080516001600160a01b03958616815260208101949094529115159183019190915290911660608201526080016100f8565b6100cf6101a63660046108c7565b61025a565b6100cf6101b9366004610780565b61037c565b6101656101cc3660046108a5565b600091825260026020818152604080852093855292905291208054600182015491909201546001600160a01b0392831693919260ff8216926101009092041690565b6001546100e4906001600160a01b031681565b6100cf61022f366004610902565b610509565b6100cf610242366004610924565b6105ab565b6100cf610255366004610902565b6105db565b6000546001600160a01b0316331461028557604051636bbaa1c160e01b815260040160405180910390fd5b6001600160a01b0383166102ac5760405163e6c4247b60e01b815260040160405180910390fd5b816102ca57604051633b19367b60e01b815260040160405180910390fd5b60008481526002602081815260408084208685529091529091209081015460ff161561030957604051634209eb7d60e01b815260040160405180910390fd5b80546001600160a01b0319166001600160a01b0385169081178255600182018390556002820180546001600160a81b031916905560405183815284919087907f6e074b649c1f27bd566a71f5f15443ca61b17b2a02554ca9edca137a8aa2aafa9060200160405180910390a45050505050565b6001600160a01b0385166103a35760405163e6c4247b60e01b815260040160405180910390fd5b60006103af838361064f565b905080516000036103d357604051633b19367b60e01b815260040160405180910390fd5b6000816040516020016103e69190610970565b60408051601f19818403018152918152815160209283012060008b81526002845282812082825290935291208054919250906001600160a01b031661043e57604051633b19367b60e01b815260040160405180910390fd5b600281015460ff161561046457604051634209eb7d60e01b815260040160405180910390fd5b60018101541580159061047a5750806001015442115b1561049857604051633c8a622d60e21b815260040160405180910390fd5b6002810180546001600160a01b038a811661010081026001600160a81b03199093169290921760011790925582546040519216825283918b907f7b4e33ed87bbe576349a5310b0a0588c3fe0437cef71142d686bbec9d8abc3bd9060200160405180910390a4505050505050505050565b6001546001600160a01b0316331461053457604051635fc483c560e01b815260040160405180910390fd5b6001600160a01b03811661055b5760405163e6c4247b60e01b815260040160405180910390fd5b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f37f6c561371bb449a598aaf7e5528fc87ad233e82669756cd67fec9c5f665a7b9190a35050565b60405183907f584dfcec25d035967c3849e8ff0ad02f80bdc315b282d68c5604e27a740d06b190600090a2505050565b6001546001600160a01b0316331461060657604051635fc483c560e01b815260040160405180910390fd5b6001600160a01b03811661062d5760405163e6c4247b60e01b815260040160405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b606060005b82811015610700577f5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e84848381811061068f5761068f61099f565b90506020028101906106a191906109b5565b35036106ee578383828181106106b9576106b961099f565b90506020028101906106cb91906109b5565b6106d99060208101906109d5565b8101906106e69190610a32565b915050610712565b806106f881610ae3565b915050610654565b50506040805160208101909152600081525b92915050565b80356001600160a01b038116811461072f57600080fd5b919050565b60008083601f84011261074657600080fd5b50813567ffffffffffffffff81111561075e57600080fd5b6020830191508360208260051b850101111561077957600080fd5b9250929050565b6000806000806000806080878903121561079957600080fd5b863595506107a960208801610718565b9450604087013567ffffffffffffffff808211156107c657600080fd5b6107d28a838b01610734565b909650945060608901359150808211156107eb57600080fd5b506107f889828a01610734565b979a9699509497509295939492505050565b600080600080600080600060a0888a03121561082557600080fd5b8735965061083560208901610718565b955061084360408901610718565b9450606088013567ffffffffffffffff8082111561086057600080fd5b61086c8b838c01610734565b909650945060808a013591508082111561088557600080fd5b506108928a828b01610734565b989b979a50959850939692959293505050565b600080604083850312156108b857600080fd5b50508035926020909101359150565b600080600080608085870312156108dd57600080fd5b843593506108ed60208601610718565b93969395505050506040820135916060013590565b60006020828403121561091457600080fd5b61091d82610718565b9392505050565b60008060006040848603121561093957600080fd5b83359250602084013567ffffffffffffffff81111561095757600080fd5b61096386828701610734565b9497909650939450505050565b6000825160005b818110156109915760208186018101518583015201610977565b506000920191825250919050565b634e487b7160e01b600052603260045260246000fd5b60008235603e198336030181126109cb57600080fd5b9190910192915050565b6000808335601e198436030181126109ec57600080fd5b83018035915067ffffffffffffffff821115610a0757600080fd5b60200191503681900382131561077957600080fd5b634e487b7160e01b600052604160045260246000fd5b600060208284031215610a4457600080fd5b813567ffffffffffffffff80821115610a5c57600080fd5b818401915084601f830112610a7057600080fd5b813581811115610a8257610a82610a1c565b604051601f8201601f19908116603f01168101908382118183101715610aaa57610aaa610a1c565b81604052828152876020848701011115610ac357600080fd5b826020860160208301376000928101602001929092525095945050505050565b600060018201610b0357634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220e67c9df4345ec78cc04ae1e79a6894eb382ca495bebc774ff9140a7de040361c64736f6c63430008140033",
      "deployedBytecode": "0x608060405234801561001057600080fd5b50600436106100b45760003560e01c80636ad37721116100715780636ad37721146101ab5780636e1e352a146101be5780638da5cb5b1461020e578063c0ed969a14610221578063c585084c14610234578063f2fde38b1461024757600080fd5b806307bcf26a146100b9578063099e4133146100d1578063363c68ac1461010157806353b557511461010157806363858aa2146101185780636669818914610198575b600080fd5b6100cf6100c7366004610780565b505050505050565b005b6000546100e4906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6100cf61010f36600461080a565b50505050505050565b6101656101263660046108a5565b600260208181526000938452604080852090915291835291208054600182015491909201546001600160a01b039283169260ff82169161010090041684565b604080516001600160a01b03958616815260208101949094529115159183019190915290911660608201526080016100f8565b6100cf6101a63660046108c7565b61025a565b6100cf6101b9366004610780565b61037c565b6101656101cc3660046108a5565b600091825260026020818152604080852093855292905291208054600182015491909201546001600160a01b0392831693919260ff8216926101009092041690565b6001546100e4906001600160a01b031681565b6100cf61022f366004610902565b610509565b6100cf610242366004610924565b6105ab565b6100cf610255366004610902565b6105db565b6000546001600160a01b0316331461028557604051636bbaa1c160e01b815260040160405180910390fd5b6001600160a01b0383166102ac5760405163e6c4247b60e01b815260040160405180910390fd5b816102ca57604051633b19367b60e01b815260040160405180910390fd5b60008481526002602081815260408084208685529091529091209081015460ff161561030957604051634209eb7d60e01b815260040160405180910390fd5b80546001600160a01b0319166001600160a01b0385169081178255600182018390556002820180546001600160a81b031916905560405183815284919087907f6e074b649c1f27bd566a71f5f15443ca61b17b2a02554ca9edca137a8aa2aafa9060200160405180910390a45050505050565b6001600160a01b0385166103a35760405163e6c4247b60e01b815260040160405180910390fd5b60006103af838361064f565b905080516000036103d357604051633b19367b60e01b815260040160405180910390fd5b6000816040516020016103e69190610970565b60408051601f19818403018152918152815160209283012060008b81526002845282812082825290935291208054919250906001600160a01b031661043e57604051633b19367b60e01b815260040160405180910390fd5b600281015460ff161561046457604051634209eb7d60e01b815260040160405180910390fd5b60018101541580159061047a5750806001015442115b1561049857604051633c8a622d60e21b815260040160405180910390fd5b6002810180546001600160a01b038a811661010081026001600160a81b03199093169290921760011790925582546040519216825283918b907f7b4e33ed87bbe576349a5310b0a0588c3fe0437cef71142d686bbec9d8abc3bd9060200160405180910390a4505050505050505050565b6001546001600160a01b0316331461053457604051635fc483c560e01b815260040160405180910390fd5b6001600160a01b03811661055b5760405163e6c4247b60e01b815260040160405180910390fd5b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f37f6c561371bb449a598aaf7e5528fc87ad233e82669756cd67fec9c5f665a7b9190a35050565b60405183907f584dfcec25d035967c3849e8ff0ad02f80bdc315b282d68c5604e27a740d06b190600090a2505050565b6001546001600160a01b0316331461060657604051635fc483c560e01b815260040160405180910390fd5b6001600160a01b03811661062d5760405163e6c4247b60e01b815260040160405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055565b606060005b82811015610700577f5797e5205a2d50babd9c0c4d9ab1fc2eb654e110118c575a0c6efc620e7e055e84848381811061068f5761068f61099f565b90506020028101906106a191906109b5565b35036106ee578383828181106106b9576106b961099f565b90506020028101906106cb91906109b5565b6106d99060208101906109d5565b8101906106e69190610a32565b915050610712565b806106f881610ae3565b915050610654565b50506040805160208101909152600081525b92915050565b80356001600160a01b038116811461072f57600080fd5b919050565b60008083601f84011261074657600080fd5b50813567ffffffffffffffff81111561075e57600080fd5b6020830191508360208260051b850101111561077957600080fd5b9250929050565b6000806000806000806080878903121561079957600080fd5b863595506107a960208801610718565b9450604087013567ffffffffffffffff808211156107c657600080fd5b6107d28a838b01610734565b909650945060608901359150808211156107eb57600080fd5b506107f889828a01610734565b979a9699509497509295939492505050565b600080600080600080600060a0888a03121561082557600080fd5b8735965061083560208901610718565b955061084360408901610718565b9450606088013567ffffffffffffffff8082111561086057600080fd5b61086c8b838c01610734565b909650945060808a013591508082111561088557600080fd5b506108928a828b01610734565b989b979a50959850939692959293505050565b600080604083850312156108b857600080fd5b50508035926020909101359150565b600080600080608085870312156108dd57600080fd5b843593506108ed60208601610718565b93969395505050506040820135916060013590565b60006020828403121561091457600080fd5b61091d82610718565b9392505050565b60008060006040848603121561093957600080fd5b83359250602084013567ffffffffffffffff81111561095757600080fd5b61096386828701610734565b9497909650939450505050565b6000825160005b818110156109915760208186018101518583015201610977565b506000920191825250919050565b634e487b7160e01b600052603260045260246000fd5b60008235603e198336030181126109cb57600080fd5b9190910192915050565b6000808335601e198436030181126109ec57600080fd5b83018035915067ffffffffffffffff821115610a0757600080fd5b60200191503681900382131561077957600080fd5b634e487b7160e01b600052604160045260246000fd5b600060208284031215610a4457600080fd5b813567ffffffffffffffff80821115610a5c57600080fd5b818401915084601f830112610a7057600080fd5b813581811115610a8257610a82610a1c565b604051601f8201601f19908116603f01168101908382118183101715610aaa57610aaa610a1c565b81604052828152876020848701011115610ac357600080fd5b826020860160208301376000928101602001929092525095945050505050565b600060018201610b0357634e487b7160e01b600052601160045260246000fd5b506001019056fea2646970667358221220e67c9df4345ec78cc04ae1e79a6894eb382ca495bebc774ff9140a7de040361c64736f6c63430008140033",
      "devdoc": {
        "details": "Implements IGroupRule interface for on-chain validation  This contract allows groups to be invite-only by: 1. Backend registers invite codes on-chain (hashed for privacy) 2. Users provide invite code when joining 3. Contract validates code and marks as used (one-time use) 4. Admins can still add members directly (override)",
        "kind": "dev",
        "methods": {
          "configure(bytes32,(bytes32,bytes)[])": {
            "details": "Called by Lens Protocol when rule is added to group",
            "params": {
              "configSalt": "Unique configuration identifier  NOTE: This is part of the IGroupRule interface. For now, we don't need any special configuration. ConfigSalt serves as unique identifier per group."
            }
          },
          "constructor": {
            "params": {
              "_backend": "Address authorized to register invites"
            }
          },
          "getInvite(bytes32,bytes32)": {
            "params": {
              "configSalt": "Group configuration identifier",
              "inviteCodeHash": "Hash of the invite code"
            },
            "returns": {
              "expiresAt": "Expiration timestamp",
              "inviter": "Address that created the invite",
              "used": "Whether the invite was used",
              "usedBy": "Address that used the invite (if used)"
            }
          },
          "processAddition(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "details": "Empty implementation = ALLOW all admin additions  WHY: Admins should be able to add members without invites. This gives admins an \"override\" capability for: - Emergency adds - Onboarding founding members - Recovering from issues  HOW IT WORKS: - Function completes without reverting - Lens Protocol interprets this as \"validation passed\" - Admin can add member successfully"
          },
          "processJoining(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "details": "Validates invite code and marks it as used",
            "params": {
              "account": "The account attempting to join",
              "configSalt": "The configuration salt for the group",
              "ruleParams": "Rule-specific parameters containing the invite code"
            }
          },
          "processLeaving(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "details": "Empty implementation = ALLOW anyone to leave anytime  WHY: Users should always have the right to leave a group. This prevents groups from becoming \"traps\" that lock users in. It's a fundamental user freedom."
          },
          "processRemoval(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "details": "Empty implementation = ALLOW all removals  WHY: Admins should always be able to remove members. This is a safety mechanism - groups should never be locked with bad actors that can't be removed."
          },
          "registerInvite(bytes32,address,bytes32,uint256)": {
            "details": "Only callable by the designated backend address",
            "params": {
              "configSalt": "The configuration salt for the group",
              "expiresAt": "The expiration timestamp (0 for no expiration)",
              "inviteCodeHash": "The hash of the invite code",
              "inviter": "The address creating the invite"
            }
          },
          "transferOwnership(address)": {
            "details": "Only callable by current owner",
            "params": {
              "newOwner": "New owner address"
            }
          },
          "updateBackend(address)": {
            "details": "Only callable by contract owner",
            "params": {
              "newBackend": "New backend address"
            }
          }
        },
        "stateVariables": {
          "PARAM__INVITE_CODE": {
            "custom:keccak": "lens.param.inviteCode"
          },
          "invites": {
            "details": "configSalt is unique per group, inviteCodeHash is unique per invite"
          }
        },
        "title": "InviteOnlyGroupRule",
        "version": 1
      },
      "userdoc": {
        "kind": "user",
        "methods": {
          "backend()": {
            "notice": "Backend address authorized to register invites"
          },
          "configure(bytes32,(bytes32,bytes)[])": {
            "notice": "Configure rule for a specific group"
          },
          "constructor": {
            "notice": "Initialize contract with backend signer address"
          },
          "getInvite(bytes32,bytes32)": {
            "notice": "Get invite details by invite code hash"
          },
          "invites(bytes32,bytes32)": {
            "notice": "Mapping of configSalt -> inviteCodeHash -> invite data"
          },
          "owner()": {
            "notice": "Contract owner (can update backend address)"
          },
          "processAddition(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "notice": "Validate when admin tries to add a member"
          },
          "processJoining(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "notice": "Process a join request (IGroupRule interface)"
          },
          "processLeaving(bytes32,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "notice": "Validate when someone tries to leave the group"
          },
          "processRemoval(bytes32,address,address,(bytes32,bytes)[],(bytes32,bytes)[])": {
            "notice": "Validate when admin tries to remove a member"
          },
          "registerInvite(bytes32,address,bytes32,uint256)": {
            "notice": "Register a new invite for a group"
          },
          "transferOwnership(address)": {
            "notice": "Transfer ownership to new address"
          },
          "updateBackend(address)": {
            "notice": "Update backend signer address"
          }
        },
        "notice": "Lens Protocol Group Rule that validates invite codes",
        "version": 1
      },
      "storageLayout": {
        "storage": [
          {
            "astId": 137,
            "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
            "label": "backend",
            "offset": 0,
            "slot": "0",
            "type": "t_address"
          },
          {
            "astId": 140,
            "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
            "label": "owner",
            "offset": 0,
            "slot": "1",
            "type": "t_address"
          },
          {
            "astId": 148,
            "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
            "label": "invites",
            "offset": 0,
            "slot": "2",
            "type": "t_mapping(t_bytes32,t_mapping(t_bytes32,t_struct(InviteData)158_storage))"
          }
        ],
        "types": {
          "t_address": {
            "encoding": "inplace",
            "label": "address",
            "numberOfBytes": "20"
          },
          "t_bool": {
            "encoding": "inplace",
            "label": "bool",
            "numberOfBytes": "1"
          },
          "t_bytes32": {
            "encoding": "inplace",
            "label": "bytes32",
            "numberOfBytes": "32"
          },
          "t_mapping(t_bytes32,t_mapping(t_bytes32,t_struct(InviteData)158_storage))": {
            "encoding": "mapping",
            "key": "t_bytes32",
            "label": "mapping(bytes32 => mapping(bytes32 => struct InviteOnlyGroupRule.InviteData))",
            "numberOfBytes": "32",
            "value": "t_mapping(t_bytes32,t_struct(InviteData)158_storage)"
          },
          "t_mapping(t_bytes32,t_struct(InviteData)158_storage)": {
            "encoding": "mapping",
            "key": "t_bytes32",
            "label": "mapping(bytes32 => struct InviteOnlyGroupRule.InviteData)",
            "numberOfBytes": "32",
            "value": "t_struct(InviteData)158_storage"
          },
          "t_struct(InviteData)158_storage": {
            "encoding": "inplace",
            "label": "struct InviteOnlyGroupRule.InviteData",
            "members": [
              {
                "astId": 151,
                "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
                "label": "inviter",
                "offset": 0,
                "slot": "0",
                "type": "t_address"
              },
              {
                "astId": 153,
                "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
                "label": "expiresAt",
                "offset": 0,
                "slot": "1",
                "type": "t_uint256"
              },
              {
                "astId": 155,
                "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
                "label": "used",
                "offset": 0,
                "slot": "2",
                "type": "t_bool"
              },
              {
                "astId": 157,
                "contract": "contracts/InviteOnlyGroupRule.sol:InviteOnlyGroupRule",
                "label": "usedBy",
                "offset": 1,
                "slot": "2",
                "type": "t_address"
              }
            ],
            "numberOfBytes": "96"
          },
          "t_uint256": {
            "encoding": "inplace",
            "label": "uint256",
            "numberOfBytes": "32"
          }
        }
      }
    },
  },
  31337: {
    ROSCAPool: {
      address: "0x61c36a8d610163660e21a8b7359e1cac0c9133e1",
      abi: [
        {
          inputs: [
            { internalType: "address", name: "_creator", type: "address" },
            { internalType: "address", name: "_circleId", type: "address" },
            { internalType: "string", name: "_circleName", type: "string" },
            { internalType: "uint256", name: "_contributionAmount", type: "uint256" },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        { inputs: [], name: "EnforcedPause", type: "error" },
        { inputs: [], name: "ExpectedPause", type: "error" },
        { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "uint8", name: "round", type: "uint8" }],
          name: "AllMembersContributed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "member", type: "address" },
            { indexed: false, internalType: "uint8", name: "round", type: "uint8" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "ContributionMade",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "member", type: "address" },
            { indexed: true, internalType: "address", name: "invitedBy", type: "address" },
          ],
          name: "MemberInvited",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "member", type: "address" },
            { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" },
          ],
          name: "MemberJoined",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
          name: "Paused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "recipient", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: false, internalType: "uint8", name: "round", type: "uint8" },
          ],
          name: "PayoutTriggered",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "uint256", name: "completionTime", type: "uint256" }],
          name: "ROSCACompleted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "circleId", type: "address" },
            { indexed: true, internalType: "address", name: "creator", type: "address" },
            { indexed: false, internalType: "uint256", name: "contributionAmount", type: "uint256" },
          ],
          name: "ROSCACreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: false, internalType: "address[]", name: "payoutOrder", type: "address[]" },
            { indexed: false, internalType: "uint256", name: "startTime", type: "uint256" },
          ],
          name: "ROSCAStarted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: false, internalType: "uint8", name: "round", type: "uint8" },
            { indexed: false, internalType: "uint256", name: "startTime", type: "uint256" },
          ],
          name: "RoundStarted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
          name: "Unpaused",
          type: "event",
        },
        {
          inputs: [],
          name: "CYCLE_DURATION",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MAX_MEMBERS",
          outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "MIN_MEMBERS",
          outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "circleId",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "circleName",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "contribute", outputs: [], stateMutability: "payable", type: "function" },
        {
          inputs: [],
          name: "contributionAmount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "creator",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "currentRound",
          outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "currentRoundPaidOut",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "currentRoundStartTime",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "everyonePaid",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getBalance",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getCurrentRecipient",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getMemberCount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getMembers",
          outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getPayoutOrder",
          outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getRoundContributors",
          outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "uint8", name: "", type: "uint8" },
          ],
          name: "hasPaid",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "hasReceivedPayout",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "member", type: "address" }],
          name: "inviteMember",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "isActive",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "isComplete",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "isInvited",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "isMember",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "joinPool", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          name: "members",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "pause", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [],
          name: "paused",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          name: "payoutOrder",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "roscaStartTime",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "startNextRound", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [{ internalType: "address[]", name: "_payoutOrder", type: "address[]" }],
          name: "startROSCA",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "totalContributed",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "triggerPayout", outputs: [], stateMutability: "nonpayable", type: "function" },
        { inputs: [], name: "unpause", outputs: [], stateMutability: "nonpayable", type: "function" },
      ],
    },
    SavingsPool: {
      address: "0xcafac3dd18ac6c6e92c921884f9e4176737c052c",
      abi: [
        {
          inputs: [
            { internalType: "address", name: "_creator", type: "address" },
            { internalType: "address", name: "_circleId", type: "address" },
            { internalType: "string", name: "_circleName", type: "string" },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        { inputs: [], name: "EnforcedPause", type: "error" },
        { inputs: [], name: "ExpectedPause", type: "error" },
        { inputs: [], name: "ReentrancyGuardReentrantCall", type: "error" },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "member", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "Deposited",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "member", type: "address" },
            { indexed: true, internalType: "address", name: "invitedBy", type: "address" },
          ],
          name: "MemberInvited",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: true, internalType: "address", name: "member", type: "address" }],
          name: "MemberJoined",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
          name: "Paused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }],
          name: "PoolClosed",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "circleId", type: "address" },
            { indexed: true, internalType: "address", name: "creator", type: "address" },
          ],
          name: "PoolCreated",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "date", type: "uint256" },
          ],
          name: "TargetSet",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [{ indexed: false, internalType: "address", name: "account", type: "address" }],
          name: "Unpaused",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "member", type: "address" },
            { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
          ],
          name: "Withdrawn",
          type: "event",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "balances",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "circleId",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "circleName",
          outputs: [{ internalType: "string", name: "", type: "string" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "closePool", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [],
          name: "creator",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
        {
          inputs: [{ internalType: "address", name: "member", type: "address" }],
          name: "getBalance",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getContractBalance",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getMemberCount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getMembers",
          outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "getProgress",
          outputs: [
            { internalType: "uint256", name: "current", type: "uint256" },
            { internalType: "uint256", name: "target", type: "uint256" },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "member", type: "address" }],
          name: "inviteMember",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "isActive",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "isGoalReached",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "isInvited",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "address", name: "", type: "address" }],
          name: "isMember",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "joinPool", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          name: "members",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "pause", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [],
          name: "paused",
          outputs: [{ internalType: "bool", name: "", type: "bool" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "_amount", type: "uint256" },
            { internalType: "uint256", name: "_date", type: "uint256" },
          ],
          name: "setTarget",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "targetAmount",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "targetDate",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "totalSaved",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        { inputs: [], name: "unpause", outputs: [], stateMutability: "nonpayable", type: "function" },
        {
          inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
          name: "withdraw",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
